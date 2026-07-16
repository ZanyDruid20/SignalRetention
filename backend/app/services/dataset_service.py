import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.user import User
from app.repositories.dataset_repository import (
    create_dataset,
    get_dataset_by_id,
    list_datasets_by_user_id,
    update_dataset_status,
)
from app.schemas.dataset import DatasetCreate

async def create_dataset_for_user(
        db: AsyncSession,
        current_user: User,
        name: str,
        filename: str,
)   -> Dataset:
    dataset_data = DatasetCreate(
        user_id=current_user.id,
        name=name,
        filename=filename,
        record_count=0,
        upload_status="pending",
    )
    return await create_dataset(db, dataset_data)

async def list_datasets_for_user(
    db: AsyncSession,
    current_user: User,
) -> list[Dataset]:
    return await list_datasets_by_user_id(db, current_user.id)

async def get_user_dataset(
        db: AsyncSession,
        current_user: User,
        dataset_id: uuid.UUID,
)   -> Dataset:
    dataset = await get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise ValueError("Dataset not found")
    if dataset.user_id != current_user.id:
        raise PermissionError("You do not have this dataset")
    return dataset

async def update_user_dataset_status(
    db: AsyncSession,
    current_user: User,
    dataset_id: uuid.UUID,
    upload_status: str,
) -> Dataset:
    await get_user_dataset(db, current_user, dataset_id)

    updated_dataset = await update_dataset_status(
        db,
        dataset_id,
        upload_status,
    )

    if updated_dataset is None:
        raise ValueError("Dataset not found")

    return updated_dataset