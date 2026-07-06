from pathlib import Path
import joblib
import pandas as pd

from config import CHURN_THRESHOLD
from preprocessing import preprocess_data

MODEL_PATH = Path("models/churn_model.pkl")

# define the risk tier and classify them into critical, high, medium, low
def get_risk_tier(probability: float) -> str:
    if probability >= 0.80:
        return "Critical"
    if probability >= 0.60:
        return "High"
    if probability >= 0.40:
        return "Medium"
    return "Low"

def predict_churn():
    # load the model
    model = joblib.load(MODEL_PATH)
    # pre process the data
    X, y = preprocess_data()
    # predict the churn
    probabilities = model.predict_proba(X)[:, 1]
    predictions = (probabilities >= CHURN_THRESHOLD).astype(int)
    # store them
    results = pd.DataFrame({
        "churn_probability": probabilities,
        "prediction": predictions
    })
    # apply the risk tier
    results["risk_tier"] = results["churn_probability"].apply(get_risk_tier)
    return results

if __name__ == "__main__":
    results = predict_churn()

    print(results.head())
    print("\nRisk Tier Counts:")
    print(results["risk_tier"].value_counts())
