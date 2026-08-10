import uuid
from decimal import Decimal
from typing import Any, TypedDict

import httpx

from app.core.config import settings
from app.schemas.prediction import PredictionCreate, RiskTier
from app.schemas.recommendation import ChurnDriver, RecommendationCreate


class DatasetPredictionResult(TypedDict):
    churn_probability: Decimal
    top_drivers: list[ChurnDriver]
    recommended_action: str


def get_risk_tier(churn_probability: Decimal) -> RiskTier:
    """Convert churn probability into a business risk tier."""
    if churn_probability >= Decimal("0.80"):
        return "Critical"
    if churn_probability >= Decimal("0.60"):
        return "High"
    if churn_probability >= Decimal("0.40"):
        return "Medium"
    return "Low"
    

def get_health_score(churn_probability: Decimal) -> int:
    """Convert churn probability into a 0-100 health score."""
    score = round((Decimal("1.0") - churn_probability) * 100)
    return max(0, min(100, int(score)))


def build_prediction(
    customer_id: uuid.UUID,
    churn_probability: Decimal,
    model_version: str,
) -> PredictionCreate:
    """Build a PredictionCreate schema from raw ML output."""
    return PredictionCreate(
        customer_id=customer_id,
        churn_probability=churn_probability,
        risk_tier=get_risk_tier(churn_probability),
        health_score=get_health_score(churn_probability),
        model_version=model_version,
    )


def build_recommendation(
    customer_id: uuid.UUID,
    risk_tier: str,
    recommended_action: str | None = None,
    top_drivers: list[ChurnDriver] | None = None,
) -> RecommendationCreate:
    if risk_tier == "Critical":
        action = "Schedule immediate retention call and offer annual contract incentive."
        priority = "urgent"
        expected_impact = "High churn reduction potential"
    elif risk_tier == "High":
        action = "Send targeted retention offer and review account satisfaction."
        priority = "high"
        expected_impact = "Moderate churn reduction potential"
    elif risk_tier == "Medium":
        action = "Monitor engagement and send proactive support message."
        priority = "medium"
        expected_impact = "Early churn prevention"
    else:
        action = "Maintain normal customer success cadence."
        priority = "low"
        expected_impact = "Low immediate intervention needed"

    return RecommendationCreate(
        customer_id=customer_id,
        action=recommended_action or action,
        priority=priority,
        expected_impact=expected_impact,
        top_drivers=top_drivers or [],
    )


async def check_ml_service_health() -> bool:
    """Check whether the separate ML service is reachable."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{settings.ml_service_url}/health")

    return response.status_code == 200


async def predict_churn_probability(customer_data: dict[str, Any]) -> Decimal:
    """Request one customer churn probability from the separate ML service."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.ml_service_url}/predict",
            json={"customer": customer_data},
        )

    response.raise_for_status()
    data = response.json()

    return Decimal(str(data["churn_probability"]))


async def build_prediction_from_customer_data(
    customer_id: uuid.UUID,
    customer_data: dict[str, Any],
    model_version: str,
) -> PredictionCreate:
    """Build a PredictionCreate schema from the ML service prediction."""
    churn_probability = await predict_churn_probability(customer_data)
    return build_prediction(customer_id, churn_probability, model_version)


async def predict_dataset(
    customers_data: list[dict[str, Any]],
) -> list[DatasetPredictionResult]:
    """Request batch predictions and explanations from the ML service."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.ml_service_url}/predict/batch",
            json={"customers": customers_data},
        )

    response.raise_for_status()
    data = response.json()

    return [
        {
            "churn_probability": Decimal(str(item["churn_probability"])),
            "top_drivers": [
                ChurnDriver.model_validate(driver)
                for driver in item.get("top_drivers", [])
            ],
            "recommended_action": item["recommended_action"],
        }
        for item in data["predictions"]
    ]
