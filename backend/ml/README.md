# FlowGuard Machine Learning & Risk Intelligence Layer

## 1. Overview & Philosophy
The FlowGuard Machine Learning & Risk Intelligence layer provides predictive intelligence for Kenya Pipeline Company (KPC) petroleum loading operations. 

It transforms canonical historical operational data stored in PostgreSQL into:
1. **Tanker Arrival Prediction**: High-precision estimation of when road tankers will reach KPC terminal security gates.
2. **Depot Turnaround Prediction**: Forecasting the full physical dwell time (Gate-In to Gate-Out) based on staging queue concurrency and bay utilization.
3. **Predicted Gate-Out**: Synthesizing `Predicted Arrival + Predicted Turnaround` for pipeline corridor coordinators.
4. **Operational Risk Scoring**: Synthesizing delay risks into an explainable 0–100 risk score with measurable underlying causal factors.

### Separation of Concerns
```
Machine Learning:       "What is likely to happen?" (Arrival & Turnaround forecasts)
       ↓
Risk Intelligence:      "How exposed are we?" (0-100 score + explainable reasons)
       ↓
Optimization:           "What should we do?" (OR-Tools - Next Phase)
       ↓
Policy Engine:          "Are we allowed to do it?" (Human-in-the-loop / safety boundaries)
       ↓
Execution:              "Carry it out." (Actuation)
       ↓
Verification & Audit:   "Did it work?" (Cryptographic telemetry verification)
```
> **Important Principle**: Machine learning predictions are **purely advisory**. Predictive services never directly actuate physical gates, gantry pumps, or dispatch queues.

---

## 2. Directory Layout

```
backend/ml/
├── README.md                     # Comprehensive architecture and operations guide
├── FEATURE_DEFINITIONS.md        # Exact feature catalog, availability, and leakage controls
├── MODEL_CARD_ARRIVAL.md         # Full model card for Tanker Arrival Predictor
├── MODEL_CARD_TURNAROUND.md      # Full model card for Depot Turnaround Predictor
├── ML_PERFORMANCE.md             # Empirical latency benchmarks and EXPLAIN ANALYZE traces
├── datasets/
│   ├── __init__.py
│   └── extractor.py              # Canonical SQL extraction and online single-order queries
├── features/
│   ├── __init__.py
│   ├── definitions.py            # Feature names, allowed sets, and leakage validators
│   └── preprocessor.py           # Scikit-Learn ColumnTransformer preprocessing pipelines
├── models/
│   ├── __init__.py
│   ├── arrival/                  # Persisted arrival pipeline artifact and metadata
│   │   ├── arrival_model_v1.joblib
│   │   └── metadata.json
│   └── turnaround/               # Persisted turnaround pipeline artifact and metadata
│       ├── turnaround_model_v1.joblib
│       └── metadata.json
├── training/
│   ├── __init__.py
│   ├── split.py                  # Chronological dataset splitting (no temporal shuffle)
│   ├── train_arrival.py          # Training script for Arrival XGBoost vs baseline
│   └── train_turnaround.py       # Training script for Turnaround XGBoost vs baseline
├── evaluation/
│   ├── __init__.py
│   └── metrics.py                # MAE, RMSE, MedAE, R2, and operational tolerance bounds
└── inference/
    ├── __init__.py
    ├── loader.py                 # In-process singleton cache (zero disk I/O per request)
    ├── arrival_predictor.py      # Real-time online arrival inference service
    ├── turnaround_predictor.py   # Real-time online turnaround inference service
    ├── gate_out_predictor.py     # Real-time Predicted Gate-Out synthesis
    └── risk_scorer.py            # Multi-factor operational risk scoring engine
```

---

## 3. Training & Reproduction Commands

All training pipelines are fully reproducible and connect directly to the canonical PostgreSQL data layer using deterministic random seeds (`random_state=42`):

```bash
# 1. Train Arrival Prediction Model
python -m backend.ml.training.train_arrival

# 2. Train Turnaround Prediction Model
python -m backend.ml.training.train_turnaround
```

### Chronological Splitting Strategy
- **Train Split**: June 11, 2026 to August 10, 2026 (6,479 orders / 62.3%)
- **Validation Split**: August 11, 2026 to August 31, 2026 (2,260 orders / 21.7%)
- **Holdout Test Split**: September 1, 2026 to September 15, 2026 (1,667 orders / 16.0%)

---

## 4. Empirical Performance Summary

### A. Arrival Prediction
- **Baseline (Planned Lead Time)**: MAE 11.38 min | RMSE 14.20 min | MedAE 9.52 min
- **FlowGuard XGBoost Model**: **MAE 10.88 min** | **RMSE 13.67 min** | **MedAE 9.20 min**
- **Observed Improvement**: Demonstrated error reduction on holdout test set.

### B. Turnaround Prediction
- **Baseline (Static KPC Depot SLA)**: MAE 22.98 min | RMSE 27.54 min | Within 10 min: 23.8%
- **FlowGuard XGBoost Model**: **MAE 10.33 min** | **RMSE 12.82 min** | **Within 10 min: 55.1%**
- **Observed Improvement**: **55.0% error reduction**; tolerance within 10 min increased by +132% relative.

---

## 5. REST API Endpoints

Integrated into the FastAPI service layer under `/api/predictions`:

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/predictions/orders/{id}/arrival` | Estimated arrival time, duration, window, and feature weights |
| `GET` | `/api/predictions/orders/{id}/turnaround` | Estimated turnaround duration, delta vs baseline, and window |
| `GET` | `/api/predictions/orders/{id}/gate-out` | Predicted Gate-Out timing (`Arrival + Turnaround`) |
| `GET` | `/api/predictions/orders/{id}/risk` | Operational risk score (0–100), risk tier, and explainable reasons |
| `GET` | `/api/predictions/depots/{id}/risk` | Aggregated terminal risk profile and bay concurrency ratio |

Interactive Swagger documentation is available at:
`http://localhost:8000/docs#/Predictions%20%26%20Risk%20Intelligence`
