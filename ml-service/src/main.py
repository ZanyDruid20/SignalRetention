from pydantic import BaseModel
from fastapi import FastAPI

from .inference import predict_customer, predict_customers


app = FastAPI(
    title="SignalRetention ML Service",
    version="1.0.0",
)


class CustomerPayload(BaseModel):
    customer: dict


class BatchPredictionPayload(BaseModel):
    customers: list[dict]


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/predict")
def predict(payload: CustomerPayload) -> dict[str, float]:
    return predict_customer(payload.customer)


@app.post("/predict/batch")
def predict_batch(payload: BatchPredictionPayload) -> dict[str, list[dict]]:
    return {"predictions": predict_customers(payload.customers)}
