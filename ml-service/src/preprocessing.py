from pathlib import Path
import pandas as pd


RAW_DATA_PATH = Path("data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv")


def load_raw_data(path: Path = RAW_DATA_PATH) -> pd.DataFrame:
    return pd.read_csv(path)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Remove duplicate rows
    df = df.drop_duplicates()

    # Convert TotalCharges to numeric
    df["TotalCharges"] = pd.to_numeric(
        df["TotalCharges"],
        errors="coerce"
    )

    # Fill missing TotalCharges with the median
    df["TotalCharges"] = df["TotalCharges"].fillna(
        df["TotalCharges"].median()
    )

    # ==========================
    # Feature Engineering
    # ==========================

    # Average amount spent per month
    df["AvgChargesPerTenure"] = (
        df["TotalCharges"] / (df["tenure"] + 1)
    )

    # Is customer on a month-to-month contract?
    df["IsMonthToMonth"] = (
        df["Contract"] == "Month-to-month"
    ).astype(int)

    # Does customer have fiber optic internet?
    df["HasFiberOptic"] = (
        df["InternetService"] == "Fiber optic"
    ).astype(int)

    # Does customer have tech support?
    df["HasTechSupport"] = (
        df["TechSupport"] == "Yes"
    ).astype(int)

    # Does customer have online security?
    df["HasOnlineSecurity"] = (
        df["OnlineSecurity"] == "Yes"
    ).astype(int)

    # ==========================
    # Continue preprocessing
    # ==========================

    # Remove identifier
    df = df.drop(columns=["customerID"])

    # Convert target labels
    df["Churn"] = df["Churn"].map({
        "No": 0,
        "Yes": 1
    })

    return df

def split_features_target(df: pd.DataFrame):
    X = df.drop(columns=["Churn"])
    y = df["Churn"]
    return X, y 
def encode_features(X: pd.DataFrame) -> pd.DataFrame:
    X_encoded = pd.get_dummies(X, drop_first=True)
    return X_encoded

def preprocess_data(path: Path = RAW_DATA_PATH):
    df = load_raw_data(path)
    df = clean_data(df)
    X, y = split_features_target(df)
    X = encode_features(X)
    return X, y

if __name__ == "__main__":
    X, y = preprocess_data()

    print("Features shape:", X.shape)
    print("Target shape:", y.shape)
    print("\nFeature columns:")
    print(X.columns.tolist())
    print("\nTarget distribution:")
    print(y.value_counts())