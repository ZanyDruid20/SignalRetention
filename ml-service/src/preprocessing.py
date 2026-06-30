from pathlib import Path
import pandas as pd


RAW_DATA_PATH = Path("data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv")


def load_raw_data(path: Path = RAW_DATA_PATH) -> pd.DataFrame:
    return pd.read_csv(path)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # remove duplicate rows
    df = df.drop_duplicates()
    # convert to numeric
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    # Fill missing TotalCharges with median
    df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())
    # Drop customerID because it is just an identifier, not a useful feature
    df = df.drop(columns=["customerID"])
    # Convert target column to numbers
    df["Churn"] = df["Churn"].map({"No": 0, "Yes": 1})
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