from pathlib import Path
import joblib
import shap

from preprocessing import preprocess_data

MODEL_PATH = Path("models/churn_model.pkl")

def explain_predictions(row_index: int = 0, top_n: int = 5):
    model = joblib.load(MODEL_PATH)
    X,y = preprocess_data()
    # use the tree explainer function to perform the explanation
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    customer_values = shap_values[row_index]
    feature_names = X.columns

    feature_impacts = list(zip(feature_names, customer_values))
    top_drivers = sorted(
        feature_impacts,
        key=lambda item: abs(item[1]),
        reverse=True,
    )[:top_n]

    return [
        {
            "feature": feature,
            "impact": float(impact),
        }
        for feature, impact in top_drivers
    ]
if __name__ == "__main__":
    explanation = explain_predictions(row_index=0)

    print("Top Churn Drivers:")
    for item in explanation:
        print(item)



