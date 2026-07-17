from functools import lru_cache

import pandas as pd

from .model_loader import load_model
from .preprocessing import clean_data, encode_features


@lru_cache(maxsize=1)
def get_model():
    return load_model()


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


def predict_customer(customer: dict) -> dict:
    model = get_model()
    X = _prepare_customer_frame(customer)
    probability = float(model.predict_proba(X)[:, 1][0])

    return {"churn_probability": probability}


def predict_customers(customers: list[dict]) -> list[dict]:
    return [predict_customer(customer) for customer in customers]
