

import json
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    EVENT_AVG_DAMAGE, EVENT_TYPE_LOOKUP,
    FEATURE_COLS, MONTH_NAME_LOOKUP,
    SEASON_MAP, STATE_AVG_DAMAGE, STATE_LOOKUP,
    TIER_NAMES, BestParams, ClassProbability,
    MetricsResponse, ModelMetric, PredictResponse,
    ShapExplanation, ShapFeature, StormInput,
)

# for HF Spaces: models/ must be at repo root or update this path
MODELS_DIR = Path(__file__).parent / "models"
COMPARISON_MODELS = ["XGBoost_tuned", "RandomForest", "XGBoost_untuned", "LogisticRegression"]

models: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    models["classifier"] = joblib.load(MODELS_DIR / "classifier.pkl")

    shap_path = MODELS_DIR / "shap_explainer.pkl"
    if shap_path.exists():
        try:
            models["shap_explainer"] = joblib.load(shap_path)
            print("SHAP explainer loaded")
        except Exception as exc:
            print(f"WARNING: failed to load shap_explainer.pkl: {exc}. /predict will return empty SHAP")
    else:
        print("WARNING: shap_explainer.pkl not found — /predict will return empty SHAP")

    yield
    models.clear()


app = FastAPI(title="Storm Damage Predictor", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://storm-damage-predictor.netlify.app",
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

def encode_input(data: StormInput) -> pd.DataFrame:
    """Validate + encode raw strings → integer feature row.
    Low-signal fields (injuries_indirect, deaths_direct, deaths_indirect) hardcoded to 0.
    """
    validation_fields = {
        "state":      (STATE_LOOKUP,      data.state),
        "event_type": (EVENT_TYPE_LOOKUP, data.event_type),
        "month_name": (MONTH_NAME_LOOKUP, data.month_name),
    }
    for label, (lookup, value) in validation_fields.items():
        if value not in lookup:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown {label}: '{value}'. Valid: {sorted(lookup.keys())}",
            )

    row = {
        "STATE":             STATE_LOOKUP[data.state],
        "MONTH_NAME":        MONTH_NAME_LOOKUP[data.month_name],
        "EVENT_TYPE":        EVENT_TYPE_LOOKUP[data.event_type],
        "INJURIES_DIRECT":   data.injuries_direct,
        "INJURIES_INDIRECT": 0,
        "DEATHS_DIRECT":     0,
        "DEATHS_INDIRECT":   0,
        "MAGNITUDE":         data.magnitude,
        "duration_min":      data.duration_min,
        "season":            SEASON_MAP[data.month_name],
        "state_avg_damage":  STATE_AVG_DAMAGE[data.state],
        "event_avg_damage":  EVENT_AVG_DAMAGE[data.event_type],
    }

    return pd.DataFrame([row], columns=FEATURE_COLS)


def compute_shap(row: pd.DataFrame, pred_class: int, top_n: int = 5) -> ShapExplanation:
    """SHAP for predicted class. Returns empty if explainer not loaded."""
    if "shap_explainer" not in models:
        return ShapExplanation(base_value=0.0, top_features=[])

    explainer = models["shap_explainer"]
    shap_vals = explainer.shap_values(row)   # (1, 12, 4)
    class_shap = shap_vals[0, :, pred_class] # (12,)

    top_idx = np.argsort(np.abs(class_shap))[::-1][:top_n]
    return ShapExplanation(
        base_value=float(explainer.expected_value[pred_class]),
        top_features=[
            ShapFeature(
                feature=FEATURE_COLS[i],
                shap_value=float(class_shap[i]),
                feature_value=float(row.iloc[0][FEATURE_COLS[i]]),
            )
            for i in top_idx
        ],
    )


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "models_loaded": list(models.keys()),
        "shap_ready": "shap_explainer" in models,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(data: StormInput) -> PredictResponse:
    row = encode_input(data)
    probs = models["classifier"].predict_proba(row)[0]
    pred_class = int(np.argmax(probs))

    return PredictResponse(
        predicted_class=pred_class,
        predicted_tier=TIER_NAMES[pred_class],
        confidence=float(probs[pred_class]),
        probabilities=[
            ClassProbability(tier=TIER_NAMES[i], probability=float(p))
            for i, p in enumerate(probs)
        ],
        shap=compute_shap(row, pred_class),
    )


@app.get("/metrics", response_model=MetricsResponse)
def metrics() -> MetricsResponse:
    path = MODELS_DIR / "metrics.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="metrics.json not found")

    raw = json.loads(path.read_text())
    return MetricsResponse(
        models=[
            ModelMetric(model=name, weighted_f1=raw[name])
            for name in COMPARISON_MODELS if name in raw
        ],
        winner=raw["winner"],
        best_params=BestParams(**raw["best_params"]),
    )