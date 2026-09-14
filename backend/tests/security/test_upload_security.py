import uuid

import pytest
from httpx import AsyncClient

from app.services.upload_service import (
    build_customer_create_row,
    parse_csv_rows,
    validate_csv_rows,
)
from app.services.validation_service import (
    MAX_FILENAME_LENGTH,
    MAX_UPLOAD_ROWS,
    MAX_UPLOAD_SIZE_MB,
    REQUIRED_CSV_COLUMNS,
    validate_upload_file,
)

from .conftest import OwnershipGraph


VALID_CSV = (
    b"customerID,tenure,MonthlyCharges,TotalCharges,Contract,"
    b"InternetService,TechSupport,OnlineSecurity\n"
    b"CUST-001,12,49.00,588.00,One year,Fiber optic,Yes,Yes\n"
)


def valid_row(**overrides: str) -> dict[str, str]:
    row = {
        "customerID": "CUST-001",
        "tenure": "12",
        "MonthlyCharges": "49.00",
        "TotalCharges": "588.00",
        "Contract": "One year",
        "InternetService": "Fiber optic",
        "TechSupport": "Yes",
        "OnlineSecurity": "Yes",
    }
    row.update(overrides)
    return row


def test_executable_disguised_with_csv_mime_is_rejected() -> None:
    with pytest.raises(ValueError, match="Only CSV files are supported"):
        validate_upload_file("payload.sh", VALID_CSV, content_type="text/csv")


def test_csv_name_with_executable_mime_is_rejected() -> None:
    with pytest.raises(ValueError, match="CSV content type"):
        validate_upload_file(
            "payload.csv",
            VALID_CSV,
            content_type="application/x-shellscript",
        )


def test_oversized_upload_is_rejected() -> None:
    payload = b"a" * ((MAX_UPLOAD_SIZE_MB * 1024 * 1024) + 1)

    with pytest.raises(ValueError, match="File size"):
        validate_upload_file("large.csv", payload, content_type="text/csv")


def test_invalid_utf8_is_rejected() -> None:
    with pytest.raises(ValueError, match="UTF-8"):
        parse_csv_rows(b"\xff\xfe\x00\x00")


def test_missing_required_columns_are_reported_safely() -> None:
    with pytest.raises(ValueError, match="missing required columns"):
        parse_csv_rows(b"customerID,tenure\nCUST-001,12\n")


def test_csv_above_row_limit_is_rejected() -> None:
    header = ",".join(sorted(REQUIRED_CSV_COLUMNS))
    rows = [header]
    for index in range(MAX_UPLOAD_ROWS + 1):
        values = {
            "customerID": f"CUST-{index}",
            "tenure": "1",
            "MonthlyCharges": "1",
            "TotalCharges": "1",
            "Contract": "monthly",
            "InternetService": "none",
            "TechSupport": "no",
            "OnlineSecurity": "no",
        }
        rows.append(",".join(values[column] for column in sorted(REQUIRED_CSV_COLUMNS)))

    with pytest.raises(ValueError, match=f"{MAX_UPLOAD_ROWS:,}"):
        parse_csv_rows("\n".join(rows).encode())


def test_duplicate_customer_identifiers_are_rejected() -> None:
    with pytest.raises(ValueError, match="Duplicate customer identifier"):
        validate_csv_rows([valid_row(), valid_row()])


@pytest.mark.parametrize(
    ("field", "value", "message"),
    [
        ("tenure", "-1", "tenure cannot be negative"),
        ("MonthlyCharges", "=2+2", "Invalid decimal"),
        ("TotalCharges", "Infinity", "finite and non-negative"),
    ],
)
def test_malicious_numeric_values_are_rejected(
    field: str,
    value: str,
    message: str,
) -> None:
    with pytest.raises(ValueError, match=message):
        build_customer_create_row(
            uuid.uuid4(),
            valid_row(**{field: value}),
            1,
        )


def test_control_characters_in_filename_are_rejected() -> None:
    with pytest.raises(ValueError, match="invalid characters"):
        validate_upload_file("customer\x00.csv", VALID_CSV, content_type="text/csv")


def test_excessively_long_filename_is_rejected() -> None:
    filename = f"{'a' * MAX_FILENAME_LENGTH}.csv"

    with pytest.raises(ValueError, match="at most"):
        validate_upload_file(filename, VALID_CSV, content_type="text/csv")


@pytest.mark.asyncio
async def test_api_rejects_oversized_upload_before_external_processing(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker
    payload = b"a" * ((MAX_UPLOAD_SIZE_MB * 1024 * 1024) + 1)

    response = await client.post(
        "/datasets/upload",
        files={"file": ("large.csv", payload, "text/csv")},
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": f"File size must be less than {MAX_UPLOAD_SIZE_MB}MB"
    }
