MAX_UPLOAD_SIZE_MB = 10
MAX_UPLOAD_ROWS = 100_000
MAX_FILENAME_LENGTH = 255
ALLOWED_CSV_CONTENT_TYPES = {
    "application/csv",
    "application/vnd.ms-excel",
    "text/csv",
    "text/plain",
}

REQUIRED_CSV_COLUMNS = {
    "customerID",
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
    "Contract",
    "InternetService",
    "TechSupport",
    "OnlineSecurity",
}


def validate_upload_file(
    filename: str,
    file_bytes: bytes,
    max_size_mb: int = MAX_UPLOAD_SIZE_MB,
    content_type: str | None = None,
) -> str:
    if not filename:
        raise ValueError("Filename is required")

    safe_filename = filename.replace("\\", "/").rsplit("/", 1)[-1].strip()
    if not safe_filename or safe_filename in {".", ".."}:
        raise ValueError("Filename is invalid")
    if len(safe_filename) > MAX_FILENAME_LENGTH:
        raise ValueError(f"Filename must be at most {MAX_FILENAME_LENGTH} characters")
    if any(ord(character) < 32 for character in safe_filename):
        raise ValueError("Filename contains invalid characters")

    if not safe_filename.lower().endswith(".csv"):
        raise ValueError("Only CSV files are supported")

    normalized_content_type = (content_type or "").split(";", 1)[0].strip().lower()
    if normalized_content_type and normalized_content_type not in ALLOWED_CSV_CONTENT_TYPES:
        raise ValueError("Uploaded file must have a CSV content type")

    if not file_bytes:
        raise ValueError("Uploaded file is empty")

    max_size_bytes = max_size_mb * 1024 * 1024

    if len(file_bytes) > max_size_bytes:
        raise ValueError(f"File size must be less than {max_size_mb}MB")

    return safe_filename
