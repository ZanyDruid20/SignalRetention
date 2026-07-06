import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import numpy as np
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from explain import explain_predictions


class TestExplain(unittest.TestCase):
    def test_explain_predictions_returns_top_drivers_sorted_by_absolute_impact(self):
        X = pd.DataFrame(
            {
                "tenure": [1],
                "MonthlyCharges": [80.0],
                "IsMonthToMonth": [1],
                "HasTechSupport": [0],
            }
        )
        y = pd.Series([1])
        shap_values = np.array([[0.20, -1.50, 0.75, -0.10]])

        explainer = Mock()
        explainer.shap_values.return_value = shap_values

        with patch("explain.joblib.load", return_value=Mock()):
            with patch("explain.preprocess_data", return_value=(X, y)):
                with patch("explain.shap.TreeExplainer", return_value=explainer):
                    result = explain_predictions(row_index=0, top_n=3)

        self.assertEqual(
            [item["feature"] for item in result],
            ["MonthlyCharges", "IsMonthToMonth", "tenure"],
        )

    def test_explain_predictions_respects_top_n(self):
        X = pd.DataFrame(
            {
                "feature_a": [1],
                "feature_b": [2],
                "feature_c": [3],
            }
        )
        y = pd.Series([0])
        shap_values = np.array([[0.30, 0.20, 0.10]])

        explainer = Mock()
        explainer.shap_values.return_value = shap_values

        with patch("explain.joblib.load", return_value=Mock()):
            with patch("explain.preprocess_data", return_value=(X, y)):
                with patch("explain.shap.TreeExplainer", return_value=explainer):
                    result = explain_predictions(row_index=0, top_n=2)

        self.assertEqual(len(result), 2)

    def test_explain_predictions_uses_requested_row_index(self):
        X = pd.DataFrame(
            {
                "feature_a": [1, 10],
                "feature_b": [2, 20],
            }
        )
        y = pd.Series([0, 1])
        shap_values = np.array(
            [
                [0.90, 0.10],
                [0.20, 1.10],
            ]
        )

        explainer = Mock()
        explainer.shap_values.return_value = shap_values

        with patch("explain.joblib.load", return_value=Mock()):
            with patch("explain.preprocess_data", return_value=(X, y)):
                with patch("explain.shap.TreeExplainer", return_value=explainer):
                    result = explain_predictions(row_index=1, top_n=1)

        self.assertEqual(result[0]["feature"], "feature_b")
        self.assertEqual(result[0]["impact"], 1.10)

    def test_explain_predictions_returns_float_impacts(self):
        X = pd.DataFrame({"feature_a": [1]})
        y = pd.Series([0])
        shap_values = np.array([[1]])

        explainer = Mock()
        explainer.shap_values.return_value = shap_values

        with patch("explain.joblib.load", return_value=Mock()):
            with patch("explain.preprocess_data", return_value=(X, y)):
                with patch("explain.shap.TreeExplainer", return_value=explainer):
                    result = explain_predictions(row_index=0, top_n=1)

        self.assertIsInstance(result[0]["impact"], float)

    def test_explain_predictions_returns_empty_list_when_top_n_is_zero(self):
        X = pd.DataFrame({"feature_a": [1]})
        y = pd.Series([0])
        shap_values = np.array([[1.0]])

        explainer = Mock()
        explainer.shap_values.return_value = shap_values

        with patch("explain.joblib.load", return_value=Mock()):
            with patch("explain.preprocess_data", return_value=(X, y)):
                with patch("explain.shap.TreeExplainer", return_value=explainer):
                    result = explain_predictions(row_index=0, top_n=0)

        self.assertEqual(result, [])

    def test_explain_predictions_raises_index_error_for_invalid_row(self):
        X = pd.DataFrame({"feature_a": [1]})
        y = pd.Series([0])
        shap_values = np.array([[1.0]])

        explainer = Mock()
        explainer.shap_values.return_value = shap_values

        with patch("explain.joblib.load", return_value=Mock()):
            with patch("explain.preprocess_data", return_value=(X, y)):
                with patch("explain.shap.TreeExplainer", return_value=explainer):
                    with self.assertRaises(IndexError):
                        explain_predictions(row_index=99)


if __name__ == "__main__":
    unittest.main()
