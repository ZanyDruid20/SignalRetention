from pathlib import Path
import pandas as pd

RAW_DATA_PATH = Path("data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv")


def load_raw_data(path: Path = RAW_DATA_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


if __name__ == "__main__":
    df = load_raw_data()

    print("Shape:")
    print(df.shape)

    print("\nColumns:")
    print(df.columns)

    print("\nFirst 5 Rows:")
    print(df.head())

    print("\nDataset Info:")
    df.info()

    print("\nSummary Statistics:")
    print(df.describe())

    print("\nMissing Values:")
    print(df.isnull().sum())

    print("\nChurn Distribution:")
    print(df["Churn"].value_counts())