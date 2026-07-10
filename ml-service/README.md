# SignalRetention ML Service

This folder contains the machine learning service for SignalRetention. It trains a churn prediction model, evaluates model quality, predicts customer churn risk, explains churn drivers, and generates retention recommendations.

The current model is an XGBoost classifier trained on the Telco Customer Churn dataset.

## What It Does

- Loads and cleans customer churn data
- Converts categorical customer fields into model-ready features
- Trains an XGBoost churn prediction model
- Evaluates accuracy, precision, recall, F1, and ROC-AUC
- Assigns churn probabilities and risk tiers
- Explains top churn drivers with SHAP
- Generates retention recommendations based on risk and drivers
- Includes unit tests for preprocessing, prediction, explanation, and recommendation logic

## Current Model Metrics

The current model uses a churn decision threshold of `0.60`.

```text
Accuracy:  0.7800
Precision: 0.5658
Recall:    0.7353
F1 Score:  0.6395
ROC-AUC:   0.8468
```

Current baseline KPIs:

```text
ROC-AUC   >= 0.80
Precision >= 55%
Recall    >= 70%
F1 Score  >= 0.60
```

The model meets these baseline KPIs.

## Project Structure

```text
ml-service/
  data/
    raw/
      WA_Fn-UseC_-Telco-Customer-Churn.csv

  models/
    churn_model.pkl

  src/
    config.py
    load_data.py
    preprocessing.py
    train.py
    evaluate.py
    cross_validate.py
    hyperparameter_tuning.py
    predict.py
    explain.py
    recommendations.py

  tests/
    test_processing.py
    test_predict.py
    test_explain.py
    test_recommendations.py
```

## Main Files

### `preprocessing.py`

Loads and prepares the dataset for modeling.

It handles:

- Duplicate removal
- `TotalCharges` numeric conversion
- Missing `TotalCharges` median fill
- Feature engineering
- Target conversion from `Yes`/`No` to `1`/`0`
- One-hot encoding for categorical features

### `train.py`

Trains the XGBoost churn model and saves it to:

```text
models/churn_model.pkl
```

### `evaluate.py`

Evaluates the trained model on a test split and prints:

- Accuracy
- Precision
- Recall
- F1 score
- ROC-AUC
- Confusion matrix
- Threshold tuning results

### `predict.py`

Loads the saved model and returns:

- `churn_probability`
- `prediction`
- `risk_tier`

Risk tiers:

```text
Critical: probability >= 0.80
High:     probability >= 0.60
Medium:   probability >= 0.40
Low:      probability < 0.40
```

### `explain.py`

Uses SHAP to identify the top churn drivers for a selected customer.

Example drivers:

```text
tenure
IsMonthToMonth
HasFiberOptic
PaymentMethod_Electronic check
PhoneService_Yes
```

### `recommendations.py`

Combines prediction results and churn explanations to generate a retention action.

Example output:

```text
Schedule immediate retention call and offer annual contract incentive.
```

## Setup

From the `ml-service` directory:
```powershell
pip install uv
```

```powershell
uv sync
```

Most commands should be run through `uv`.

## Common Commands

Run preprocessing:

```powershell
uv run python src\preprocessing.py
```

Train the model:

```powershell
uv run python src\train.py
```

Evaluate the model:

```powershell
uv run python src\evaluate.py
```

Run cross-validation:

```powershell
uv run python src\cross_validate.py
```

Run hyperparameter tuning:

```powershell
uv run python src\hyperparameter_tuning.py
```

Generate predictions:

```powershell
uv run python src\predict.py
```

Explain a prediction:

```powershell
uv run python src\explain.py
```

Generate a recommendation:

```powershell
uv run python src\recommendations.py
```

## Testing

Run all tests:

```powershell
uv run python -m unittest discover tests
```

If `uv run` fails because of a local cache or permission issue, run the same command with the project virtual environment directly:

```powershell
.\.venv\Scripts\python.exe -m unittest discover tests
```

Current test coverage includes:

- Preprocessing logic
- Edge cases for cleaned data
- Prediction risk tiers
- Churn threshold behavior
- SHAP explanation formatting and sorting
- Recommendation business rules

Current test result:

```text
Ran 40 tests
OK
```

## Deployment Notes

For production-style deployment, the model and datasets should be stored outside the app container.

Planned architecture:

```text
Frontend: Vercel
Auth: Clerk
Backend API: Railway
Database: Railway Postgres
Model and datasets: Google Cloud Storage
CI/CD: GitHub Actions
```

The backend should load the model from Google Cloud Storage and store prediction results in the database.

## Notes

- The current trained model is a baseline model, not a final production model.
- Accuracy alone is not enough for churn prediction because the dataset is imbalanced.
- Recall, precision, F1, and ROC-AUC should be reviewed together.
- The current threshold is `0.60`, which reduces false alarms while keeping recall above the project baseline.
