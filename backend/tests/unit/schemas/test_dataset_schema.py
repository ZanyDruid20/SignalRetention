import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.dataset import (
    DatasetCreate,
    DatasetRead,
    DatasetUpdate,
    UploadStatus,
)

@pytest.fixture
def valid_dataset_data() -> dict[str, object]:
    return {
        "user_id": str(uuid.uuid4()),
        "name": "Customer Churn Dataset",
        "filename": "customers.csv",
        "record_count": 7043,
        "upload_status": "completed",
    }

def test_valid_dataset_create(
        valid_dataset_data: dict[str, object],
) -> None:
    dataset = DatasetCreate.model_validate(valid_dataset_data)
    assert isinstance(dataset.user_id, uuid.UUID)
    assert dataset.name == "Customer Churn Dataset"
    assert dataset.filename == "customers.csv"
    assert dataset.record_count == 7043
    assert dataset.upload_status == "completed"

def test_dataset_create_uses_defaults() -> None:
    dataset = DatasetCreate(
        user_id=uuid.uuid4(),
        name="Customers",
        filename="customers.csv",
    )

    assert dataset.record_count == 0
    assert dataset.upload_status == "pending"

def test_negative_record_count_is_rejected(
    valid_dataset_data: dict[str, object],
) -> None:
    valid_dataset_data["record_count"] = -1

    with pytest.raises(ValidationError):
        DatasetCreate.model_validate(valid_dataset_data)


@pytest.mark.parametrize(
    "upload_status",
    ["pending", "processing", "completed", "failed"],
)
def test_valid_upload_status_is_accepted(
    valid_dataset_data: dict[str, object],
    upload_status: UploadStatus,
) -> None:
    valid_dataset_data["upload_status"] = upload_status

    dataset = DatasetCreate.model_validate(valid_dataset_data)

    assert dataset.upload_status == upload_status


def test_invalid_upload_status_is_rejected(
    valid_dataset_data: dict[str, object],
) -> None:
    valid_dataset_data["upload_status"] = "finished"

    with pytest.raises(ValidationError):
        DatasetCreate.model_validate(valid_dataset_data)


@pytest.mark.parametrize(
    "missing_field",
    ["user_id", "name", "filename"],
)
def test_missing_required_field_is_rejected(
    valid_dataset_data: dict[str, object],
    missing_field: str,
) -> None:
    del valid_dataset_data[missing_field]

    with pytest.raises(ValidationError):
        DatasetCreate.model_validate(valid_dataset_data)


@pytest.mark.parametrize(
    ("field", "invalid_value"),
    [
        ("name", ""),
        ("filename", ""),
        ("name", "a" * 256),
        ("filename", "a" * 256),
    ],
)
def test_invalid_text_fields_are_rejected(
    valid_dataset_data: dict[str, object],
    field: str,
    invalid_value: str,
) -> None:
    valid_dataset_data[field] = invalid_value

    with pytest.raises(ValidationError):
        DatasetCreate.model_validate(valid_dataset_data)

def test_dataset_update_allows_partial_data() -> None:
    update = DatasetUpdate(upload_status="processing")

    assert update.name is None
    assert update.record_count is None
    assert update.upload_status == "processing"

def test_valid_dataset_read(
    valid_dataset_data: dict[str, object],
) -> None:
    response_data = {
        **valid_dataset_data,
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    dataset = DatasetRead.model_validate(response_data)

    assert isinstance(dataset.id, uuid.UUID)
    assert isinstance(dataset.user_id, uuid.UUID)
    assert isinstance(dataset.created_at, datetime)
