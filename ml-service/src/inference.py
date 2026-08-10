from functools import lru_cache

import pandas as pd
import shap

from .model_loader import load_model
from .preprocessing import clean_data, encode_features
from .recommendations import generate_recommendation


@lru_cache(maxsize=1)
def get_model():
    return load_model()


@lru_cache(maxsize=1)
def get_explainer():
    return shap.TreeExplainer(get_model())


def _prepare_customer_frame(customer: dict) -> pd.DataFrame:
    df = pd.DataFrame([customer])

    if "Churn" not in df.columns:
        df["Churn"] = "No"

    cleaned = clean_data(df)
    X = cleaned.drop(columns=["Churn"])
    X = encode_features(X)

    model = get_model()
    feature_names = list(getattr(model, "feature_names_in_", X.columns))

    return X.reindex(columns=feature_names, fill_value=0)


def _prepare_customers_frame(customers: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(customers)

    if "Churn" not in df.columns:
        df["Churn"] = "No"

    cleaned = clean_data(df)
    X = cleaned.drop(columns=["Churn"])
    X = encode_features(X)

    model = get_model()
    feature_names = list(getattr(model, "feature_names_in_", X.columns))

    return X.reindex(columns=feature_names, fill_value=0)


def predict_customer(customer: dict) -> dict:
    model = get_model()
    X = _prepare_customer_frame(customer)
    probability = float(model.predict_proba(X)[:, 1][0])

    return {"churn_probability": probability}


def predict_customers(customers: list[dict]) -> list[dict]:
    model = get_model()
    X = _prepare_customers_frame(customers)
    probabilities = model.predict_proba(X)[:, 1]
    shap_values = get_explainer().shap_values(X)

    if isinstance(shap_values, list):
        shap_values = shap_values[-1]

    return [
        _build_prediction_result(probability, X.columns, customer_impacts)
        for probability, customer_impacts in zip(probabilities, shap_values)
    ]


def _build_prediction_result(
    probability,
    feature_names,
    feature_impacts,
    top_n: int = 5,
) -> dict:
    risk_tier = _get_risk_tier(float(probability))
    top_drivers = sorted(
        (
            {"feature": feature, "impact": float(impact)}
            for feature, impact in zip(feature_names, feature_impacts)
        ),
        key=lambda driver: abs(driver["impact"]),
        reverse=True,
    )[:top_n]

    return {
        "churn_probability": float(probability),
        "top_drivers": top_drivers,
        "recommended_action": generate_recommendation(risk_tier, top_drivers),
    }


def _get_risk_tier(probability: float) -> str:
    if probability >= 0.80:
        return "Critical"
    if probability >= 0.60:
        return "High"
    if probability >= 0.40:
        return "Medium"
    return "Low"
