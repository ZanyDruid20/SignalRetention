from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
import numpy as np

from config import CHURN_THRESHOLD
from train import train_model


def evaluate_model():
    model, X_train, X_test, y_train, y_test = train_model()

    probability_predictions = model.predict_proba(X_test)[:, 1]
    hard_predictions = (probability_predictions >= CHURN_THRESHOLD).astype(int)

    accuracy = accuracy_score(y_test, hard_predictions)
    precision = precision_score(y_test, hard_predictions)
    recall = recall_score(y_test, hard_predictions)
    f1 = f1_score(y_test, hard_predictions)
    roc_auc = roc_auc_score(y_test, probability_predictions)

    print("Model Evaluation Results")
    print("------------------------")
    print(f"Threshold: {CHURN_THRESHOLD:.2f}")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, hard_predictions))

    print("\nClassification Report:")
    print(classification_report(y_test, hard_predictions))

    thresholds = [0.5, 0.55, CHURN_THRESHOLD, 0.65, 0.7]

    print("\nThreshold Tuning:")
    print("-----------------")

    for threshold in thresholds:
        threshold_predictions = (probability_predictions >= threshold).astype(int)

        threshold_precision = precision_score(y_test, threshold_predictions)
        threshold_recall = recall_score(y_test, threshold_predictions)
        threshold_f1 = f1_score(y_test, threshold_predictions)

        print(
            f"Threshold: {threshold:.2f} | "
            f"Precision: {threshold_precision:.4f} | "
            f"Recall: {threshold_recall:.4f} | "
            f"F1: {threshold_f1:.4f}"
        )

    best_threshold = CHURN_THRESHOLD
    best_f1 = f1
    best_precision = precision
    best_recall = recall

    for threshold in np.arange(0.1, 0.91, 0.01):
        threshold_predictions = (probability_predictions >= threshold).astype(int)
        threshold_f1 = f1_score(y_test, threshold_predictions)

        if threshold_f1 > best_f1:
            best_threshold = threshold
            best_f1 = threshold_f1
            best_precision = precision_score(y_test, threshold_predictions)
            best_recall = recall_score(y_test, threshold_predictions)

    print("\nBest F1 Threshold:")
    print("------------------")
    print(
        f"Threshold: {best_threshold:.2f} | "
        f"Precision: {best_precision:.4f} | "
        f"Recall: {best_recall:.4f} | "
        f"F1: {best_f1:.4f}"
    )

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "roc_auc": roc_auc,
    }


if __name__ == "__main__":
    evaluate_model()
