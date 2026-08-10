import unittest
from unittest.mock import Mock, patch

import numpy as np
import pandas as pd

from src.inference import predict_customers


class TestBatchInference(unittest.TestCase):
    def test_predict_customers_returns_shap_drivers_and_recommendations(self):
        customers = [{"customerID": "customer-1"}, {"customerID": "customer-2"}]
        features = pd.DataFrame(
            {
                "IsMonthToMonth": [1, 0],
                "MonthlyCharges": [90.0, 40.0],
            }
        )

        model = Mock()
        model.predict_proba.return_value = np.array(
            [[0.10, 0.90], [0.70, 0.30]]
        )

        explainer = Mock()
        explainer.shap_values.return_value = np.array(
            [[1.2, 0.3], [0.1, -0.8]]
        )

        with patch("src.inference.get_model", return_value=model):
            with patch(
                "src.inference._prepare_customers_frame",
                return_value=features,
            ):
                with patch("src.inference.get_explainer", return_value=explainer):
                    results = predict_customers(customers)

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["churn_probability"], 0.90)
        self.assertEqual(results[0]["top_drivers"][0]["feature"], "IsMonthToMonth")
        self.assertEqual(
            results[0]["recommended_action"],
            "Schedule immediate retention call and offer annual contract incentive.",
        )
        self.assertEqual(results[1]["churn_probability"], 0.30)
        self.assertIn("standard engagement", results[1]["recommended_action"])


if __name__ == "__main__":
    unittest.main()
