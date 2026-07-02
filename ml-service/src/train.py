from pathlib import Path
import joblib
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from preprocessing import preprocess_data

MODEL_PATH = Path("models/churn_model.pkl")

def train_model():
    X, y = preprocess_data()

    # Train, test and split the model
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size= 0.2,
        stratify=y,
        random_state=42,
    )

    # Balance the churn class using only the training split.
    num_stayed = (y_train == 0).sum()
    num_churned = (y_train == 1).sum()
    scale_pos_weight = num_stayed / num_churned

    model = XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=2,
        subsample=0.75,
        colsample_bytree=0.85,
        min_child_weight=1,
        gamma=0.3,
        scale_pos_weight=scale_pos_weight,
        eval_metric="aucpr",
        random_state=42,
    )

    model.fit(X_train, y_train)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    return model, X_train, X_test, y_train, y_test
if __name__ == "__main__":
    model, X_train, X_test, y_train, y_test = train_model()

    print("Model trained successfully")
    print(f"Model saved to: {MODEL_PATH}")
    print("Training rows:", X_train.shape[0])
    print("Testing rows:", X_test.shape[0])
