from pathlib import Path

from app.storage.gcs import delete_blob_from_gcs, upload_bytes_to_gcs


def build_dataset_upload_path(
    user_id: str,
    dataset_id: str,
    filename: str,
) -> str:
    if not user_id:
        raise ValueError("User ID is required")

    if not dataset_id:
        raise ValueError("Dataset ID is required")

    if not filename:
        raise ValueError("Filename is required")

    safe_filename = Path(filename).name
    return f"uploads/{user_id}/{dataset_id}/{safe_filename}"


async def upload_dataset_file(
    user_id: str,
    dataset_id: str,
    filename: str,
    file_bytes: bytes,
) -> str:
    blob_path = build_dataset_upload_path(user_id, dataset_id, filename)
    return upload_bytes_to_gcs(blob_path, file_bytes)


async def delete_dataset_file(blob_path: str) -> None:
    delete_blob_from_gcs(blob_path)
