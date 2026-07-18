from google.cloud import storage

from app.core.config import settings


def get_gcs_client() -> storage.Client:
    return storage.Client()


def get_gcs_bucket() -> storage.Bucket:
    if settings.gcs_bucket_name is None:
        raise ValueError("GCS bucket name is not configured")

    client = get_gcs_client()
    return client.bucket(settings.gcs_bucket_name)


def upload_bytes_to_gcs(
    blob_path: str,
    file_bytes: bytes,
    content_type: str = "text/csv",
) -> str:
    if not blob_path:
        raise ValueError("GCS blob path is required")

    if not file_bytes:
        raise ValueError("File bytes are required")

    bucket = get_gcs_bucket()
    blob = bucket.blob(blob_path)
    blob.upload_from_string(file_bytes, content_type=content_type)

    return blob_path


def delete_blob_from_gcs(blob_path: str) -> None:
    if not blob_path:
        raise ValueError("GCS blob path is required")

    bucket = get_gcs_bucket()
    blob = bucket.blob(blob_path)
    blob.delete()
