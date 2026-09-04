import pytest
from app.services.validation_service import validate_upload_file

def test_valid_csv_is_accepted(valid_csv_bytes: bytes) -> None:
    result = validate_upload_file(
        filename="customer.csv",
        file_bytes=valid_csv_bytes,
        content_type="text/csv",
    )
    assert result == "customer.csv"

def test_non_csv_extension_is_rejected(
        valid_csv_bytes: bytes,
) -> None:
    with pytest.raises(
        ValueError,
        match="Only CSV files are supported",
    ):
        validate_upload_file(
            filename="customers.exe",
            file_bytes=valid_csv_bytes,
            content_type="application/octet-stream",
        )

def test_empty_file_is_rejected() -> None:
    with pytest.raises(
        ValueError,
        match="Uploaded file is empty",
    ):
        validate_upload_file(
            filename="customers.csv",
            file_bytes=b"",
            content_type="text/csv",
        )

def test_directory_paths_are_removed(
    valid_csv_bytes: bytes
) -> None:
    result = validate_upload_file(
        filename="../../customer.csv",
        file_bytes=valid_csv_bytes,
        content_type="text/csv",
    )

    assert result == "customer.csv"

def test_invalid_content_type_is_rejected(
    valid_csv_bytes: bytes,
) -> None:
    with pytest.raises(
        ValueError,
        match="Uploaded file must have a CSV content type",
    ):
        validate_upload_file(
            filename="customers.csv",
            file_bytes=valid_csv_bytes,
            content_type="application/x-shellscript",
        )

def test_file_exactly_at_size_limit_is_accepted() -> None:
    file_bytes = b"a" * (1024 * 1024)

    result = validate_upload_file(
        filename="customer.csv",
        file_bytes=file_bytes,
        max_size_mb=1,
        content_type="text/csv",
    )

    assert result == "customer.csv"

def test_file_above_size_limit_is_rejected() -> None:
    file_bytes = b"a" * ((1024 * 1024) + 1)

    with pytest.raises(
        ValueError,
        match="File size must be less than 1MB",
    ):
        validate_upload_file(
            filename="customers.csv",
            file_bytes=file_bytes,
            max_size_mb=1,
            content_type="text/csv",
        )
