import os
from pathlib import Path
from tempfile import NamedTemporaryFile

import joblib
from google.cloud import storage


LOCAL_MODEL_PATH = Path("models/churn_model.pkl")


def load_model():
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    model_blob_name = os.getenv("MODEL_BLOB_NAME")

    if bucket_name and model_blob_name:
        return load_model_from_gcs(bucket_name, model_blob_name)

    return joblib.load(LOCAL_MODEL_PATH)


def load_model_from_gcs(bucket_name: str, model_blob_name: str):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(model_blob_name)

    temp_path: Path | None = None

    try:
        with NamedTemporaryFile(suffix=".pkl", delete=False) as model_file:
            temp_path = Path(model_file.name)

        blob.download_to_filename(str(temp_path))
        return joblib.load(temp_path)
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink()
