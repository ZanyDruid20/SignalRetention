import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import numpy as np
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from predict import get_risk_tier, predict_churn


class TestPredict(unittest.TestCase):
    def test_get_risk_tier_returns_critical(self):
        self.assertEqual(get_risk_tier(0.80), "Critical")
        self.assertEqual(get_risk_tier(0.95), "Critical")

    def test_get_risk_tier_returns_high(self):
        self.assertEqual(get_risk_tier(0.60), "High")
        self.assertEqual(get_risk_tier(0.79), "High")

    def test_get_risk_tier_returns_medium(self):
        self.assertEqual(get_risk_tier(0.40), "Medium")
        self.assertEqual(get_risk_tier(0.59), "Medium")

    def test_get_risk_tier_returns_low(self):
        self.assertEqual(get_risk_tier(0.00), "Low")
        self.assertEqual(get_risk_tier(0.39), "Low")

    def test_get_risk_tier_handles_values_just_below_boundaries(self):
        self.assertEqual(get_risk_tier(0.7999), "High")
        self.assertEqual(get_risk_tier(0.5999), "Medium")
        self.assertEqual(get_risk_tier(0.3999), "Low")

    def test_get_risk_tier_handles_extreme_probabilities(self):
        self.assertEqual(get_risk_tier(1.00), "Critical")
        self.assertEqual(get_risk_tier(-0.10), "Low")

    def test_predict_churn_returns_expected_columns(self):
        X = pd.DataFrame({"feature": [1, 2, 3]})
        y = pd.Series([0, 1, 0])

        model = Mock()
        model.predict_proba.return_value = np.array(
            [
                [0.90, 0.10],
                [0.35, 0.65],
                [0.15, 0.85],
            ]
        )

        with patch("predict.joblib.load", return_value=model):
            with patch("predict.preprocess_data", return_value=(X, y)):
                results = predict_churn()

        self.assertEqual(
            list(results.columns),
            ["churn_probability", "prediction", "risk_tier"],
        )

    def test_predict_churn_uses_project_threshold(self):
        X = pd.DataFrame({"feature": [1, 2, 3]})
        y = pd.Series([0, 1, 0])

        model = Mock()
        model.predict_proba.return_value = np.array(
            [
                [0.41, 0.59],
                [0.40, 0.60],
                [0.39, 0.61],
            ]
        )

        with patch("predict.joblib.load", return_value=model):
            with patch("predict.preprocess_data", return_value=(X, y)):
                results = predict_churn()

        self.assertEqual(results["prediction"].tolist(), [0, 1, 1])

    def test_predict_churn_assigns_risk_tiers(self):
        X = pd.DataFrame({"feature": [1, 2, 3, 4]})
        y = pd.Series([0, 0, 1, 1])

        model = Mock()
        model.predict_proba.return_value = np.array(
            [
                [0.90, 0.10],
                [0.55, 0.45],
                [0.35, 0.65],
                [0.15, 0.85],
            ]
        )

        with patch("predict.joblib.load", return_value=model):
            with patch("predict.preprocess_data", return_value=(X, y)):
                results = predict_churn()

        self.assertEqual(
            results["risk_tier"].tolist(),
            ["Low", "Medium", "High", "Critical"],
        )

    def test_predict_churn_handles_empty_dataset(self):
        X = pd.DataFrame({"feature": []})
        y = pd.Series([], dtype=int)

        model = Mock()
        model.predict_proba.return_value = np.empty((0, 2))

        with patch("predict.joblib.load", return_value=model):
            with patch("predict.preprocess_data", return_value=(X, y)):
                results = predict_churn()

        self.assertTrue(results.empty)
        self.assertEqual(
            list(results.columns),
            ["churn_probability", "prediction", "risk_tier"],
        )


if __name__ == "__main__":
    unittest.main()
