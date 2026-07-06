import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from preprocessing import clean_data, encode_features, preprocess_data, split_features_target


def make_sample_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "customerID": ["001", "002", "003"],
            "gender": ["Female", "Male", "Female"],
            "SeniorCitizen": [0, 1, 0],
            "Partner": ["Yes", "No", "No"],
            "Dependents": ["No", "No", "Yes"],
            "tenure": [1, 12, 24],
            "PhoneService": ["No", "Yes", "Yes"],
            "MultipleLines": ["No phone service", "No", "Yes"],
            "InternetService": ["DSL", "Fiber optic", "No"],
            "OnlineSecurity": ["No", "No", "No internet service"],
            "OnlineBackup": ["Yes", "No", "No internet service"],
            "DeviceProtection": ["No", "Yes", "No internet service"],
            "TechSupport": ["No", "Yes", "No internet service"],
            "StreamingTV": ["No", "Yes", "No internet service"],
            "StreamingMovies": ["No", "Yes", "No internet service"],
            "Contract": ["Month-to-month", "One year", "Two year"],
            "PaperlessBilling": ["Yes", "Yes", "No"],
            "PaymentMethod": ["Electronic check", "Mailed check", "Bank transfer"],
            "MonthlyCharges": [29.85, 70.70, 20.00],
            "TotalCharges": ["29.85", " ", "480.00"],
            "Churn": ["No", "Yes", "No"],
        }
    )


class TestPreprocessing(unittest.TestCase):
    def test_clean_data_converts_total_charges_to_numeric(self):
        cleaned = clean_data(make_sample_data())

        self.assertTrue(pd.api.types.is_numeric_dtype(cleaned["TotalCharges"]))
        self.assertEqual(cleaned["TotalCharges"].isna().sum(), 0)

    def test_clean_data_drops_duplicate_rows(self):
        sample_data = pd.concat(
            [make_sample_data(), make_sample_data().iloc[[0]]],
            ignore_index=True,
        )

        cleaned = clean_data(sample_data)

        self.assertEqual(len(cleaned), 3)

    def test_clean_data_does_not_modify_original_dataframe(self):
        sample_data = make_sample_data()

        clean_data(sample_data)

        self.assertIn("customerID", sample_data.columns)
        self.assertEqual(sample_data["TotalCharges"].tolist(), ["29.85", " ", "480.00"])

    def test_clean_data_removes_customer_id_and_encodes_target(self):
        cleaned = clean_data(make_sample_data())

        self.assertNotIn("customerID", cleaned.columns)
        self.assertEqual(set(cleaned["Churn"].unique()), {0, 1})

    def test_clean_data_adds_engineered_features(self):
        cleaned = clean_data(make_sample_data())

        expected_columns = {
            "AvgChargesPerTenure",
            "IsMonthToMonth",
            "HasFiberOptic",
            "HasTechSupport",
            "HasOnlineSecurity",
        }

        self.assertTrue(expected_columns.issubset(cleaned.columns))

    def test_clean_data_handles_zero_tenure_without_dividing_by_zero(self):
        sample_data = make_sample_data()
        sample_data.loc[0, "tenure"] = 0

        cleaned = clean_data(sample_data)

        self.assertEqual(cleaned.loc[0, "AvgChargesPerTenure"], 29.85)

    def test_clean_data_fills_blank_total_charges_with_median(self):
        cleaned = clean_data(make_sample_data())

        self.assertEqual(cleaned.loc[1, "TotalCharges"], 254.925)

    def test_split_features_target_separates_churn_column(self):
        cleaned = clean_data(make_sample_data())
        X, y = split_features_target(cleaned)

        self.assertNotIn("Churn", X.columns)
        self.assertEqual(len(X), len(y))

    def test_encode_features_returns_numeric_columns(self):
        cleaned = clean_data(make_sample_data())
        X, _ = split_features_target(cleaned)
        X_encoded = encode_features(X)

        self.assertTrue(all(pd.api.types.is_numeric_dtype(dtype) for dtype in X_encoded.dtypes))

    def test_preprocess_data_returns_matching_features_and_target(self):
        with patch("preprocessing.load_raw_data", return_value=make_sample_data()):
            X, y = preprocess_data()

        self.assertEqual(len(X), len(y))
        self.assertNotIn("Churn", X.columns)
        self.assertTrue(all(pd.api.types.is_numeric_dtype(dtype) for dtype in X.dtypes))


if __name__ == "__main__":
    unittest.main()
