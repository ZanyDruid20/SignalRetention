from xgboost import XGBClassifier
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
from sklearn.metrics import classification_report, roc_auc_score

from preprocessing import preprocess_data


def tune_model():
    X, y = preprocess_data()

    num_stayed = (y == 0).sum()
    num_churned = (y == 1).sum()
    scale_pos_weight = num_stayed / num_churned

    model = XGBClassifier(
        eval_metric="aucpr",
        scale_pos_weight=scale_pos_weight,
        random_state=42,
    )

    param_grid = {
        "n_estimators": [100, 200, 300, 400],
        "learning_rate": [0.01, 0.03, 0.05, 0.1],
        "max_depth": [2, 3, 4, 5],
        "subsample": [0.75, 0.85, 1.0],
        "colsample_bytree": [0.75, 0.85, 1.0],
        "min_child_weight": [1, 3, 5],
        "gamma": [0, 0.1, 0.3],
    }

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    search = RandomizedSearchCV(
        estimator=model,
        param_distributions=param_grid,
        n_iter=25,
        scoring="f1",
        cv=cv,
        verbose=1,
        random_state=42,
        n_jobs=-1,
    )

    search.fit(X, y)

    print("Best Parameters:")
    print(search.best_params_)

    print("\nBest F1 Score:")
    print(search.best_score_)

    best_model = search.best_estimator_

    probabilities = best_model.predict_proba(X)[:, 1]
    predictions = best_model.predict(X)

    print("\nTraining ROC-AUC:")
    print(roc_auc_score(y, probabilities))

    print("\nClassification Report:")
    print(classification_report(y, predictions))

    return best_model, search.best_params_


if __name__ == "__main__":
    tune_model()