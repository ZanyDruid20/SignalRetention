from predict import predict_churn
from explain import explain_predictions


def generate_recommendation(risk_tier: str, top_drivers: list[dict]) -> str:
    driver_names = [driver["feature"] for driver in top_drivers]

    if risk_tier == "Critical":
        if "IsMonthToMonth" in driver_names or "Contract_Two year" in driver_names:
            return "Schedule immediate retention call and offer annual contract incentive."
        if "MonthlyCharges" in driver_names or "AvgChargesPerTenure" in driver_names:
            return "Offer pricing review or loyalty discount."
        if "HasTechSupport" in driver_names:
            return "Assign customer success manager and provide technical support outreach."
        return "Prioritize immediate outreach with personalized retention offer."

    if risk_tier == "High":
        return "Schedule proactive check-in and provide targeted retention offer."

    if risk_tier == "Medium":
        return "Monitor engagement and send educational resources or product tips."

    return "Maintain standard engagement and continue monitoring customer health."


def generate_customer_recommendation(row_index: int = 0):
    predictions = predict_churn()

    customer_prediction = predictions.iloc[row_index]
    risk_tier = customer_prediction["risk_tier"]
    probability = customer_prediction["churn_probability"]

    top_drivers = explain_predictions(row_index=row_index)

    recommendation = generate_recommendation(
        risk_tier=risk_tier,
        top_drivers=top_drivers,
    )

    return {
        "customer_index": row_index,
        "churn_probability": float(probability),
        "risk_tier": risk_tier,
        "top_drivers": top_drivers,
        "recommended_action": recommendation,
    }


if __name__ == "__main__":
    result = generate_customer_recommendation(row_index=0)

    print(result)