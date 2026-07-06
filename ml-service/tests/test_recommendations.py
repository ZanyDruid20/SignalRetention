import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from recommendations import generate_customer_recommendation, generate_recommendation


class TestRecommendations(unittest.TestCase):
    def test_critical_month_to_month_gets_contract_incentive(self):
        result = generate_recommendation(
            risk_tier="Critical",
            top_drivers=[{"feature": "IsMonthToMonth", "impact": 0.46}],
        )

        self.assertEqual(
            result,
            "Schedule immediate retention call and offer annual contract incentive.",
        )

    def test_critical_two_year_contract_driver_gets_contract_incentive(self):
        result = generate_recommendation(
            risk_tier="Critical",
            top_drivers=[{"feature": "Contract_Two year", "impact": -0.40}],
        )

        self.assertEqual(
            result,
            "Schedule immediate retention call and offer annual contract incentive.",
        )

    def test_critical_monthly_charges_gets_pricing_recommendation(self):
        result = generate_recommendation(
            risk_tier="Critical",
            top_drivers=[{"feature": "MonthlyCharges", "impact": 0.30}],
        )

        self.assertEqual(result, "Offer pricing review or loyalty discount.")

    def test_critical_average_charges_gets_pricing_recommendation(self):
        result = generate_recommendation(
            risk_tier="Critical",
            top_drivers=[{"feature": "AvgChargesPerTenure", "impact": 0.30}],
        )

        self.assertEqual(result, "Offer pricing review or loyalty discount.")

    def test_critical_tech_support_gets_support_recommendation(self):
        result = generate_recommendation(
            risk_tier="Critical",
            top_drivers=[{"feature": "HasTechSupport", "impact": 0.25}],
        )

        self.assertEqual(
            result,
            "Assign customer success manager and provide technical support outreach.",
        )

    def test_critical_unknown_driver_gets_default_urgent_recommendation(self):
        result = generate_recommendation(
            risk_tier="Critical",
            top_drivers=[{"feature": "tenure", "impact": 1.04}],
        )

        self.assertEqual(
            result,
            "Prioritize immediate outreach with personalized retention offer.",
        )

    def test_critical_recommendation_uses_first_matching_priority_rule(self):
        result = generate_recommendation(
            risk_tier="Critical",
            top_drivers=[
                {"feature": "MonthlyCharges", "impact": 0.30},
                {"feature": "IsMonthToMonth", "impact": 0.20},
            ],
        )

        self.assertEqual(
            result,
            "Schedule immediate retention call and offer annual contract incentive.",
        )

    def test_high_risk_gets_proactive_check_in(self):
        result = generate_recommendation(
            risk_tier="High",
            top_drivers=[{"feature": "MonthlyCharges", "impact": 0.30}],
        )

        self.assertEqual(
            result,
            "Schedule proactive check-in and provide targeted retention offer.",
        )

    def test_medium_risk_gets_monitoring_recommendation(self):
        result = generate_recommendation(
            risk_tier="Medium",
            top_drivers=[],
        )

        self.assertEqual(
            result,
            "Monitor engagement and send educational resources or product tips.",
        )

    def test_low_risk_gets_standard_engagement_recommendation(self):
        result = generate_recommendation(
            risk_tier="Low",
            top_drivers=[],
        )

        self.assertEqual(
            result,
            "Maintain standard engagement and continue monitoring customer health.",
        )

    def test_unknown_risk_tier_defaults_to_standard_engagement(self):
        result = generate_recommendation(
            risk_tier="Unknown",
            top_drivers=[],
        )

        self.assertEqual(
            result,
            "Maintain standard engagement and continue monitoring customer health.",
        )

    def test_generate_customer_recommendation_combines_prediction_explanation_and_action(self):
        predictions = pd.DataFrame(
            {
                "churn_probability": [0.86],
                "prediction": [1],
                "risk_tier": ["Critical"],
            }
        )
        top_drivers = [{"feature": "IsMonthToMonth", "impact": 0.46}]

        with patch("recommendations.predict_churn", return_value=predictions):
            with patch("recommendations.explain_predictions", return_value=top_drivers):
                result = generate_customer_recommendation(row_index=0)

        self.assertEqual(result["customer_index"], 0)
        self.assertEqual(result["churn_probability"], 0.86)
        self.assertEqual(result["risk_tier"], "Critical")
        self.assertEqual(result["top_drivers"], top_drivers)
        self.assertEqual(
            result["recommended_action"],
            "Schedule immediate retention call and offer annual contract incentive.",
        )

    def test_generate_customer_recommendation_uses_requested_row_index(self):
        predictions = pd.DataFrame(
            {
                "churn_probability": [0.30, 0.65],
                "prediction": [0, 1],
                "risk_tier": ["Low", "High"],
            }
        )
        top_drivers = [{"feature": "MonthlyCharges", "impact": 0.30}]

        with patch("recommendations.predict_churn", return_value=predictions):
            with patch("recommendations.explain_predictions", return_value=top_drivers) as explain_mock:
                result = generate_customer_recommendation(row_index=1)

        explain_mock.assert_called_once_with(row_index=1)
        self.assertEqual(result["customer_index"], 1)
        self.assertEqual(result["churn_probability"], 0.65)
        self.assertEqual(result["risk_tier"], "High")
        self.assertEqual(
            result["recommended_action"],
            "Schedule proactive check-in and provide targeted retention offer.",
        )

    def test_generate_customer_recommendation_raises_index_error_for_invalid_row(self):
        predictions = pd.DataFrame(
            {
                "churn_probability": [0.30],
                "prediction": [0],
                "risk_tier": ["Low"],
            }
        )

        with patch("recommendations.predict_churn", return_value=predictions):
            with patch("recommendations.explain_predictions", return_value=[]):
                with self.assertRaises(IndexError):
                    generate_customer_recommendation(row_index=99)


if __name__ == "__main__":
    unittest.main()
