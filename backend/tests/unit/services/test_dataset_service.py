import uuid
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.user import User
from app.schemas.dataset import DatasetCreate
from app.services import dataset_service


def make_dataset(user_id: uuid.UUID) -> Dataset:
    return Dataset(
        id=uuid.uuid4(),
        user_id=user_id,
        name="Customer Churn",
        filename="customers.csv",
        record_count=0,
        upload_status="pending",
    )


@pytest.mark.asyncio
async def test_create_dataset_for_user(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset = make_dataset(test_user.id)
    create_mock = AsyncMock(return_value=dataset)
    monkeypatch.setattr(dataset_service, "create_dataset", create_mock)

    result = await dataset_service.create_dataset_for_user(
        db, test_user, "Customer Churn", "customers.csv"
    )

    assert result is dataset
    create_mock.assert_awaited_once_with(
        db,
        DatasetCreate(
            user_id=test_user.id,
            name="Customer Churn",
            filename="customers.csv",
            record_count=0,
            upload_status="pending",
        ),
    )


@pytest.mark.asyncio
async def test_list_datasets_uses_authenticated_user(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    datasets = [make_dataset(test_user.id)]
    list_mock = AsyncMock(return_value=datasets)
    monkeypatch.setattr(dataset_service, "list_datasets_by_user_id", list_mock)

    result = await dataset_service.list_datasets_for_user(db, test_user)

    assert result == datasets
    list_mock.assert_awaited_once_with(db, test_user.id)


@pytest.mark.asyncio
async def test_get_user_dataset_raises_when_not_found(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset_id = uuid.uuid4()
    monkeypatch.setattr(
        dataset_service, "get_dataset_by_id", AsyncMock(return_value=None)
    )

    with pytest.raises(ValueError, match="Dataset not found"):
        await dataset_service.get_user_dataset(db, test_user, dataset_id)


@pytest.mark.asyncio
async def test_get_user_dataset_rejects_different_owner(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset = make_dataset(uuid.uuid4())
    monkeypatch.setattr(
        dataset_service, "get_dataset_by_id", AsyncMock(return_value=dataset)
    )

    with pytest.raises(PermissionError, match="do not have this dataset"):
        await dataset_service.get_user_dataset(db, test_user, dataset.id)


@pytest.mark.asyncio
async def test_update_dataset_status_after_ownership_check(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset = make_dataset(test_user.id)
    updated = make_dataset(test_user.id)
    updated.id = dataset.id
    updated.upload_status = "processing"
    ownership_mock = AsyncMock(return_value=dataset)
    update_mock = AsyncMock(return_value=updated)
    monkeypatch.setattr(dataset_service, "get_user_dataset", ownership_mock)
    monkeypatch.setattr(dataset_service, "update_dataset_status", update_mock)

    result = await dataset_service.update_user_dataset_status(
        db, test_user, dataset.id, "processing"
    )

    assert result is updated
    ownership_mock.assert_awaited_once_with(db, test_user, dataset.id)
    update_mock.assert_awaited_once_with(db, dataset.id, "processing")


@pytest.mark.asyncio
async def test_complete_dataset_upload_updates_metadata(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset = make_dataset(test_user.id)
    completed = make_dataset(test_user.id)
    completed.id = dataset.id
    completed.upload_status = "completed"
    completed.record_count = 7043
    monkeypatch.setattr(
        dataset_service, "get_user_dataset", AsyncMock(return_value=dataset)
    )
    update_mock = AsyncMock(return_value=completed)
    monkeypatch.setattr(
        dataset_service, "update_dataset_upload_metadata", update_mock
    )

    result = await dataset_service.complete_user_dataset_upload(
        db, test_user, dataset.id, 7043
    )

    assert result is completed
    update_mock.assert_awaited_once_with(
        db=db,
        dataset_id=dataset.id,
        upload_status="completed",
        record_count=7043,
    )


@pytest.mark.asyncio
async def test_delete_dataset_removes_file_then_database_record(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset = make_dataset(test_user.id)
    ownership_mock = AsyncMock(return_value=dataset)
    delete_file_mock = AsyncMock()
    delete_dataset_mock = AsyncMock()
    expected_path = (
        f"uploads/{test_user.id}/{dataset.id}/{dataset.filename}"
    )

    monkeypatch.setattr(dataset_service, "get_user_dataset", ownership_mock)
    monkeypatch.setattr(
        dataset_service,
        "build_dataset_upload_path",
        lambda **_: expected_path,
    )
    monkeypatch.setattr(dataset_service, "delete_dataset_file", delete_file_mock)
    monkeypatch.setattr(dataset_service, "delete_dataset", delete_dataset_mock)

    await dataset_service.delete_user_dataset(db, test_user, dataset.id)

    ownership_mock.assert_awaited_once_with(db, test_user, dataset.id)
    delete_file_mock.assert_awaited_once_with(expected_path)
    delete_dataset_mock.assert_awaited_once_with(db, dataset)
