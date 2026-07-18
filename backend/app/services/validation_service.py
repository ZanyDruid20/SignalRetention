from pathlib import Path


def validate_upload_file(
    filename: str,
    file_bytes: bytes,
    max_size_mb: int = 10,
) -> None:
    if not filename:
        raise ValueError("Filename is required")

    if Path(filename).suffix.lower() != ".csv":
        raise ValueError("Only CSV files are supported")

    if not file_bytes:
        raise ValueError("Uploaded file is empty")

    max_size_bytes = max_size_mb * 1024 * 1024

    if len(file_bytes) > max_size_bytes:
        raise ValueError(f"File size must be less than {max_size_mb}MB")