import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.dataset_repository import (
    create_dataset,
    delete_dataset,
    get_dataset_by_id,
    list_datasets_by_user_id,
    update_dataset_status,
    update_dataset_upload_metadata,
)
from app.schemas.dataset import DatasetCreate


async def create_test_user(db_session: AsyncSession, suffix: str) -> User:
    user = User(
        clerk_user_id=f"user_{suffix}_{uuid.uuid4()}",
        email=f"{suffix}_{uuid.uuid4()}@example.com",
        name=f"Test User {suffix}",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


def dataset_data(user: User, name: str = "Customer Churn") -> DatasetCreate:
    return DatasetCreate(
        user_id=user.id,
        name=name,
        filename=f"{name.lower().replace(' ', '-')}.csv",
    )


@pytest.mark.asyncio
async def test_create_and_get_dataset(db_session: AsyncSession) -> None:
    user = await create_test_user(db_session, "owner")

    created = await create_dataset(db_session, dataset_data(user))
    retrieved = await get_dataset_by_id(db_session, created.id)

    assert retrieved is not None
    assert retrieved.id == created.id
    assert retrieved.user_id == user.id
    assert retrieved.name == "Customer Churn"
    assert retrieved.filename == "customer-churn.csv"
    assert retrieved.record_count == 0
    assert retrieved.upload_status == "pending"
    assert retrieved.created_at is not None


@pytest.mark.asyncio
async def test_list_datasets_filters_by_user(db_session: AsyncSession) -> None:
    first_user = await create_test_user(db_session, "first")
    second_user = await create_test_user(db_session, "second")
    first_dataset = await create_dataset(
        db_session, dataset_data(first_user, "First Dataset")
    )
    second_dataset = await create_dataset(
        db_session, dataset_data(second_user, "Second Dataset")
    )

    results = await list_datasets_by_user_id(db_session, first_user.id)

    assert [dataset.id for dataset in results] == [first_dataset.id]
    assert second_dataset.id not in {dataset.id for dataset in results}


@pytest.mark.asyncio
async def test_update_dataset_status(db_session: AsyncSession) -> None:
    user = await create_test_user(db_session, "status")
    dataset = await create_dataset(db_session, dataset_data(user))

    updated = await update_dataset_status(db_session, dataset.id, "processing")
    missing = await update_dataset_status(db_session, uuid.uuid4(), "failed")

    assert updated is not None
    assert updated.upload_status == "processing"
    assert missing is None


@pytest.mark.asyncio
async def test_update_dataset_upload_metadata(
    db_session: AsyncSession,
) -> None:
    user = await create_test_user(db_session, "metadata")
    dataset = await create_dataset(db_session, dataset_data(user))

    updated = await update_dataset_upload_metadata(
        db_session,
        dataset.id,
        upload_status="completed",
        record_count=7043,
    )

    assert updated is not None
    assert updated.upload_status == "completed"
    assert updated.record_count == 7043


@pytest.mark.asyncio
async def test_delete_dataset(db_session: AsyncSession) -> None:
    user = await create_test_user(db_session, "delete")
    dataset = await create_dataset(db_session, dataset_data(user))
    dataset_id = dataset.id

    await delete_dataset(db_session, dataset)

    assert await get_dataset_by_id(db_session, dataset_id) is None
