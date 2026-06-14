---
title: Storm Damage Predictor
emoji: ⛈
colorFrom: blue
colorTo: blue
sdk: docker
app_file: app.py
pinned: false
---

# Storm Damage Predictor API

FastAPI backend for predicting storm damage severity (None/Low/Medium/High).

Built on 1.78M NOAA weather events using XGBoost (weighted F1: 0.79).

## Endpoints
- `GET /health` — check status
- `POST /predict` — predict damage tier
- `GET /metrics` — model comparison
- `GET /docs` — Swagger UI