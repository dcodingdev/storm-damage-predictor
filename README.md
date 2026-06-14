# Storm Damage Predictor

> End-to-end ML system classifying storm property damage into 4 severity tiers — trained on 1.78M NOAA(National Oceanic and Atmospheric Administration) events, deployed on HuggingFace + Netlify.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=flat-square&logo=netlify)](https://storm-damage-predictor.netlify.app)
[![API](https://img.shields.io/badge/API-HuggingFace%20Spaces-FFD21E?style=flat-square&logo=huggingface)](https://dcodingdev28-storm-damage-predictor.hf.space/docs)
[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?style=flat-square&logo=github)](https://github.com/dcodingdev/storm-damage-predictor)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)
![XGBoost](https://img.shields.io/badge/XGBoost-GPU-EC6600?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-Docker-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react)

---

## What It Does

Input a storm event (type, state, month, magnitude, duration, casualties) → model predicts damage severity tier with confidence scores + SHAP explanation of the top-5 driving features.

| Tier | Property Damage | Example |
|------|----------------|---------|
| **None** | $0 | Wyoming Frost/Freeze |
| **Low** | $1 – $10K | Small hail event |
| **Medium** | $10K – $500K | Flash flood, suburban area |
| **High** | > $500K | Louisiana Hurricane |

**Weighted F1 = 0.79** on a real-distribution 356K-row test set (not resampled).

---

## Live Links

| | URL |
|--|-----|
| Frontend | https://storm-damage-predictor.netlify.app |
| API (Swagger) | https://dcodingdev28-storm-damage-predictor.hf.space/docs |
| GitHub | https://github.com/dcodingdev/storm-damage-predictor |

> First API request may take ~30s — HuggingFace Spaces cold starts on CPU Basic tier.

---

## Results

### Model Benchmark (identical SMOTE-balanced splits)

| Model | Weighted F1 |
|-------|------------|
| **XGBoost — Tuned (Optuna 50 trials)** | **0.7916** |
| XGBoost — Baseline | 0.7178 |
| Random Forest | 0.7066 |
| Logistic Regression | 0.5321 |

Tuned XGBoost outperformed Random Forest by **+4.1% F1** and Logistic Regression by **+46%**.

### Classification Report (356,146-row test set)

```
              precision    recall  f1-score   support
        None       0.95      0.81      0.88    275,531
         Low       0.47      0.71      0.57     41,081
      Medium       0.39      0.53      0.45     35,088
        High       0.22      0.49      0.30      4,446
weighted avg       0.83      0.77      0.79    356,146
```

---

## Key Engineering Decisions

### Class Imbalance (77% None / 1.2% High)
Applied **SMOTE exclusively on the training split** — test set kept at real-world distribution. SMOTE on full dataset before splitting is data leakage; this preserves honest evaluation.

```
Before SMOTE: 1,424,584 train rows
After SMOTE:  ~4,400,000 train rows (balanced across 4 classes)
```

### Data Leakage Prevention
30 annual NOAA CSVs concatenated in consistent column order before any encoding. Feature engineering (`state_avg_damage`, `event_avg_damage`) computed on raw strings before LabelEncoding — if order flipped, groupby breaks silently and contaminates the model.

### Optuna Bayesian Search
50-trial Bayesian search on Colab T4 GPU. Result: **+9.7% F1 improvement** over baseline XGBoost with default params.

### Why Classifier, Not Regressor
Regression was attempted first (R² = 0.22). Storm damage has high inherent randomness — same event type can produce $500 or $50M depending on path. Classification into tiers tells a cleaner, more actionable story.

---

## Architecture

```
NOAA CSVs (30 files, 1.78M rows)
        ↓
  Preprocessing Notebook
  - 51 cols → 14 cols
  - Null handling, damage string parsing
  - Duration calculation
        ↓
  Feature Engineering Notebook (Colab T4)
  - +3 features: season, state_avg_damage, event_avg_damage
  - SMOTE on train split only
  - Optuna 50-trial GPU search
  - Saves: classifier.pkl, shap_explainer.pkl, rf.pkl, metrics.json
        ↓
┌────────────────────┐         ┌─────────────────────────┐
│  FastAPI Backend   │  ←───→  │    React Frontend        │
│  Docker (HF Space) │         │    Vite + Tailwind v4    │
│  /predict          │         │    Netlify               │
│  /metrics          │         │    Tier badge            │
│  /health           │         │    Confidence bars        │
│  SHAP explainer    │         │    SHAP feature chart    │
└────────────────────┘         │    4-model comparison    │
                               └─────────────────────────┘
```

---

## Features Used (12 total)

| Feature | Type | Source |
|---------|------|--------|
| `STATE` | Categorical | NOAA raw |
| `YEAR` | Numeric | NOAA raw |
| `MONTH_NAME` | Categorical | NOAA raw |
| `EVENT_TYPE` | Categorical | NOAA raw |
| `INJURIES_DIRECT` | Numeric | NOAA raw |
| `INJURIES_INDIRECT` | Numeric | NOAA raw |
| `DEATHS_DIRECT` | Numeric | NOAA raw |
| `DEATHS_INDIRECT` | Numeric | NOAA raw |
| `MAGNITUDE` | Numeric | NOAA raw |
| `duration_min` | Numeric | **Engineered** — from datetime diff, capped at 10K |
| `state_avg_damage` | Numeric | **Engineered** — historical mean damage per state |
| `event_avg_damage` | Numeric | **Engineered** — historical mean damage per event type |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Python 3.12 |
| ML | XGBoost (GPU), scikit-learn, imbalanced-learn (SMOTE) |
| Explainability | SHAP TreeExplainer |
| Hyperparameter Search | Optuna (Bayesian, 50 trials) |
| Training Compute | Google Colab T4 GPU |
| API | FastAPI + Uvicorn + Pydantic |
| Containerization | Docker (python:3.12-slim) |
| Backend Deploy | HuggingFace Spaces (CPU Basic) |
| Frontend | React + Vite + Tailwind v4 |
| Frontend Deploy | Netlify |
| Package Manager | uv (10–100x faster than pip) |
| Model Storage | Git LFS (pkl files via HF Space git) |

---

## Project Structure

```
storm-damage-predictor/
├── backend/
│   ├── app.py               # FastAPI — /predict, /metrics, /health
│   ├── schemas.py           # Pydantic models + hardcoded label encodings
│   ├── Dockerfile           # python:3.12-slim, port 7860 (HF required)
│   ├── requirements.txt     # 9 prod libs only (manual — not uv export)
│   └── models/
│       ├── classifier.pkl       # Tuned XGBoost (Git LFS)
│       ├── shap_explainer.pkl   # SHAP TreeExplainer (Git LFS)
│       ├── rf.pkl               # Random Forest for comparison (Git LFS)
│       └── metrics.json         # 4-model benchmark scores
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── constants.js         # STATE_OPTIONS, EVENT_TYPE_OPTIONS, MONTH_OPTIONS
│       └── components/
│           ├── PredictForm.jsx  # 4 required inputs + Advanced toggle
│           ├── ResultPanel.jsx  # Tier badge + probability bars
│           ├── ShapChart.jsx    # Horizontal SHAP bar chart
│           └── ModelStats.jsx   # /metrics comparison table
│
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb   # local — clean + parquet
│   ├── 03_model_training.ipynb  # Colab T4 — SMOTE + Optuna + XGBoost
│   ├── 04_model_comparison.ipynb
│   └── 05_shap.ipynb
│
└── data/                        # gitignored — download from NOAA
    ├── raw/                     # 30 CSVs + storm_raw_combined.parquet
    └── processed/               # storm_clean.parquet, storm_featured.parquet
```

---

## Local Setup

### Backend

```bash
# Requires Python 3.12+
curl -LsSf https://astral.sh/uv/install.sh | sh   # install uv

git clone https://github.com/dcodingdev/storm-damage-predictor.git
cd storm-damage-predictor

uv init
uv python pin 3.12
uv add fastapi uvicorn xgboost scikit-learn shap joblib pandas numpy imbalanced-learn
uv add --dev jupyter ipykernel matplotlib seaborn optuna

# Run API locally (needs models/ pkl files — see Data section)
uv run uvicorn backend.app:app --reload --port 8000
# → http://localhost:8000/docs
```

### Frontend

```bash
# Requires Node.js v22.12.0+ or v20.19+
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

Update `API_BASE` in `src/App.jsx` to `http://localhost:8000` for local dev.

---

## Data

Source: [NOAA StormEvents Database](https://www.ncdc.noaa.gov/stormevents/ftp.jsp) — Details files, 1996–2025.

Download 30 CSVs manually, unzip into `data/raw/`. All data files are gitignored.

```
Files: 30 CSVs (1996–2025)
Raw:   1,780,730 rows × 51 cols
Final: 1,780,730 rows × 12 features + 1 target
```

Run notebooks in order: `01_eda` → `02_preprocessing` (local) → `03_model_training` (Colab T4) → `04_model_comparison` → `05_shap`.

---

## API Reference

**`POST /predict`**

```json
{
  "STATE": "LOUISIANA",
  "YEAR": 2024,
  "MONTH_NAME": "August",
  "EVENT_TYPE": "Hurricane",
  "INJURIES_DIRECT": 5,
  "INJURIES_INDIRECT": 0,
  "DEATHS_DIRECT": 0,
  "DEATHS_INDIRECT": 0,
  "MAGNITUDE": 120.0,
  "duration_min": 1440
}
```

Response includes: `tier`, `tier_label`, `confidence`, `probabilities[4]`, `shap_values[top_5_features]`.

**`GET /metrics`** — Returns 4-model F1 benchmark scores.

**`GET /health`** — Returns model load status.

---

## Known Limitations & Next Steps

- **High tier recall is low (0.49)** — rare class (1.2% of data); model still misses many truly catastrophic events
- `YEAR` not currently used as a feature — adding it may capture climate trend signal
- High tier threshold ($500K) is aggressive; lowering to $100K could improve class balance
- CatBoost not benchmarked — worth trying for categorical-heavy data like this

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built with NOAA open data. Predictions are probabilistic estimates — not engineering assessments.*
