from xgboost import XGBClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate

from preprocessing import preprocess_data


def run_cross_validation():
    X, y = preprocess_data()

    num_stayed = (y == 0).sum()
    num_churned = (y == 1).sum()
    scale_pos_weight = num_stayed / num_churned

    model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=3,
        subsample=0.85,
        colsample_bytree=0.85,
        scale_pos_weight=scale_pos_weight,
        eval_metric="aucpr",
        random_state=42,
    )

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    scoring = {
        "accuracy": "accuracy",
        "precision": "precision",
        "recall": "recall",
        "f1": "f1",
        "roc_auc": "roc_auc",
    }

    results = cross_validate(
        model,
        X,
        y,
        cv=cv,
        scoring=scoring,
        n_jobs=1,
    )

    print("Cross-Validation Results")
    print("------------------------")

    for metric in scoring.keys():
        scores = results[f"test_{metric}"]
        print(f"{metric}: {scores.mean():.4f} +/- {scores.std():.4f}")


if __name__ == "__main__":
    run_cross_validation()
