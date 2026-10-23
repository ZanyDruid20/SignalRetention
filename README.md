# SignalRetention

SignalRetention is a customer churn intelligence application that helps teams identify customers at risk of leaving, understand the factors behind each prediction, and organize retention actions.

**Live application:** [https://signal-retention.vercel.app/](https://signal-retention.vercel.app/)

## Why It Exists

Customer success and retention teams often have customer data but no practical way to prioritize outreach. SignalRetention turns a supported customer CSV into:

- churn probabilities and risk tiers;
- customer health scores and portfolio-level risk metrics;
- SHAP-based explanations of the strongest factors behind each prediction;
- recommended retention actions that can be tracked through completion.

The project is also an end-to-end engineering example: authenticated file ingestion, object storage, asynchronous database access, batch model inference, explainability, and a responsive analytics interface are implemented as separate services.

## Current Features

- Clerk authentication with protected application routes and authenticated API requests
- CSV upload validation, including filename, content type, file size, row count, required columns, and duplicate customer identifiers
- A bundled 7,043-row demo dataset that can be submitted through the normal upload workflow
- Private dataset storage in Google Cloud Storage
- Customer, prediction, recommendation, and simulation persistence in PostgreSQL
- XGBoost churn probabilities processed in batches of up to 500 customers
- Risk tiers (`Low`, `Medium`, `High`, and `Critical`) and 0-100 health scores
- Top churn drivers calculated with SHAP
- Rule-based retention recommendations informed by risk tier and model explanations
- Dashboard summaries, risk distribution, revenue-at-risk calculations, and high-risk customer views
- Searchable and filterable customer explorer with customer detail pages
- Paginated prediction and recommendation views
- Recommendation workflow states and status updates
- Retention scenario simulations with projected customer and revenue impact
- Light, dark, and system themes
- Per-account settings stored in the browser on the current device

## Architecture

```text
Next.js frontend
    |
    | Clerk JWT + CSV/form or JSON request
    v
FastAPI backend
    |-- PostgreSQL: users, datasets, customers, predictions,
    |               recommendations, and simulations
    |-- Google Cloud Storage: uploaded CSV files
    |-- Redis: optional per-user rate-limit counters
    |
    | batches of up to 500 customer records
    v
FastAPI ML service
    |-- XGBoost probability inference
    |-- SHAP feature attribution
    `-- rule-based recommendation generation
```

### Upload and Prediction Flow

1. The frontend obtains a Clerk token from the `signalretention` JWT template and uploads a CSV to `POST /datasets/upload`.
2. The backend validates the file and its required Telco Customer Churn fields.
3. A dataset record is created, its status becomes `processing`, and the original CSV is stored in Google Cloud Storage.
4. Customer rows are normalized and inserted into PostgreSQL in bulk.
5. The backend sends bounded batches of 500 rows to the ML service.
6. The ML service preprocesses each batch as one DataFrame, computes XGBoost probabilities, and calculates SHAP values.
7. The backend derives risk tiers and health scores, builds recommendations, and bulk-inserts predictions and recommendations.
8. The dataset is marked `completed`, after which the frontend loads dashboard, customer, prediction, and recommendation views from the API.

The upload request currently remains open for the complete pipeline; processing is not delegated to a background job.

### Upload Performance Work

A local end-to-end test using the same 7,043-row CSV improved from **134 seconds to 5.2 seconds** after the database persistence path was changed.

The original implementation committed and refreshed predictions individually and performed repeated per-customer authorization queries. The current implementation builds records in memory, uses SQLAlchemy bulk `add_all()` operations with one commit per collection, removes per-record refreshes, and authorizes recommendation batches with one set-based ownership query. This reduces database round trips rather than eliminating the inexpensive in-memory record-building loop.

The ML inference path is also vectorized: a batch is cleaned and encoded as one DataFrame and passed to one `predict_proba` call instead of invoking single-customer inference repeatedly.

## Tech Stack

### Frontend

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS and shadcn/Radix UI components
- Recharts
- Clerk Next.js SDK
- Vitest, Testing Library, and Playwright

### Backend

- Python 3.14+
- FastAPI and Uvicorn
- SQLAlchemy async ORM with asyncpg
- Alembic migrations
- Pydantic settings and schemas
- PyJWT with Clerk JWKS verification
- HTTPX
- Pytest

### Machine Learning

- XGBoost
- pandas and NumPy
- scikit-learn
- SHAP
- joblib

### Infrastructure

- Vercel for the public frontend
- PostgreSQL for relational application data
- Google Cloud Storage for uploaded datasets and optional model artifact loading
- Redis for optional rate limiting
- Clerk for authentication
- Separate FastAPI services for the application API and model inference

## Model Evaluation

The current model is an `XGBClassifier` evaluated on the bundled Telco Customer Churn dataset containing 7,043 rows before preprocessing. The implementation:

- removes duplicate rows;
- converts numeric fields and fills missing numeric values with medians;
- adds contract, service, and charge-derived features;
- one-hot encodes categorical features;
- uses a stratified 80/20 train/test split with `random_state=42`;
- calculates class weighting from the training split only;
- evaluates hard classifications at a `0.60` churn threshold.

| Metric | Holdout result |
| --- | ---: |
| Accuracy | 78.00% |
| ROC-AUC | 0.8468 |
| Precision | 56.58% |
| Recall | 73.53% |
| F1 score | 0.6395 |

These are offline results from one holdout split of this dataset. They describe model behavior under the repository's evaluation procedure; they are not guaranteed business outcomes and have not been validated on an external production dataset.

## Local Setup

### Prerequisites

- Node.js 20.9 or newer
- Python 3.14 or newer
- [uv](https://docs.astral.sh/uv/)
- Docker with Docker Compose
- A Clerk application with a JWT template named `signalretention`
- A Google Cloud Storage bucket and application credentials for dataset uploads

Run the following commands from the repository root unless a different directory is shown.

### 1. Start PostgreSQL and Redis

```powershell
cd backend
docker compose up -d
cd ..
```

The compose file exposes PostgreSQL on `localhost:5433` and Redis on `localhost:6379`.

### 2. Configure and Start the ML Service

The raw training data and generated model directory are gitignored. The same CSV is tracked as the frontend demo dataset, so it can be copied into the training location locally.

```powershell
New-Item -ItemType Directory -Force ml-service\data\raw | Out-Null
Copy-Item my-app\public\demo\signal-retention-demo.csv ml-service\data\raw\WA_Fn-UseC_-Telco-Customer-Churn.csv
cd ml-service
uv sync
uv run python src\train.py
uv run uvicorn src.main:app --reload --port 8001
```

Keep this terminal running. Local model loading defaults to `ml-service/models/churn_model.pkl`.

For model loading from Google Cloud Storage instead, create `ml-service/.env`:

```dotenv
GCS_BUCKET_NAME=your-model-artifacts-bucket
MODEL_BLOB_NAME=models/churn_model.pkl
GOOGLE_APPLICATION_CREDENTIALS=C:\absolute\path\to\service-account.json
```

Then start the service with that environment file:

```powershell
uv run uvicorn src.main:app --reload --port 8001 --env-file .env
```

### 3. Configure and Start the Backend

Create `backend/.env` with values for your Clerk instance and Google Cloud project:

```dotenv
DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/signal_retention_dev
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_ISSUER=https://your-clerk-issuer
REDIS_URL=redis://127.0.0.1:6379/0
GCS_BUCKET_NAME=your-dataset-uploads-bucket
GOOGLE_APPLICATION_CREDENTIALS=C:\absolute\path\to\service-account.json
ML_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000
```

Then install dependencies, apply migrations, and start the API:

```powershell
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

Keep this terminal running.

### 4. Configure and Start the Frontend

Create `my-app/.env.local`:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The Clerk application must issue tokens from the `signalretention` JWT template, and its issuer must match `CLERK_ISSUER` in the backend.

```powershell
cd my-app
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Documentation

With the backend running locally:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Service health: [http://localhost:8000/health](http://localhost:8000/health)
- Database health: [http://localhost:8000/health/database](http://localhost:8000/health/database)
- ML service health: [http://localhost:8001/health](http://localhost:8001/health)

Application endpoints are grouped under `/auth`, `/datasets`, `/customers`, `/dashboard`, `/predictions`, `/recommendations`, and `/simulations`. Except for health checks, the application flow uses Clerk bearer tokens.

## Testing

Backend tests:

```powershell
cd backend
uv sync --group dev
uv run pytest
```

Backend coverage:

```powershell
uv run pytest --cov=app --cov-report=term-missing
```

ML service tests:

```powershell
cd ml-service
uv sync
uv run python -m unittest discover tests
```

Frontend unit and component tests:

```powershell
cd my-app
npm ci
npm run test:run
```

Frontend lint, production build, and browser tests:

```powershell
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts or reuses the frontend at `http://localhost:3000`; authenticated end-to-end scenarios also require the supporting services and Clerk configuration.

## Current Limitations

- Uploads must be CSV files no larger than 10 MB or 100,000 rows and must contain the required Telco Customer Churn columns.
- The trained model and preprocessing contract are specific to that schema; arbitrary customer datasets are not supported yet.
- Upload processing is synchronous, and the frontend does not receive true staged or row-level progress updates.
- Offline model metrics come from one dataset and one holdout split, without external or production-data validation.
- Recommendations are rule-based outputs, not experimentally verified intervention outcomes.
- Settings and notification preferences are stored in browser local storage for the current account and device.
- Notification controls do not send email, push, or external notifications.
- Dashboard `estimated_revenue_saved` is not currently calculated.
- Redis is optional; when it is not configured, API rate limiting is disabled.

## Planned Improvements

Plans explicitly represented in the current UI and project notes are:

- support additional customer dataset schemas;
- add real processing progress instead of an indeterminate upload state;
- connect notification preferences to actual processing and risk events.

These items are not part of the current implementation.
