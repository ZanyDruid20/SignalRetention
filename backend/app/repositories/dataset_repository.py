import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate

async def get_dataset_by_id(
        db: AsyncSession,
        dataset_id: uuid.UUID,
) -> Dataset | None:
    statement = select(Dataset).where(Dataset.id == dataset_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()

async def list_datasets_by_user_id(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[Dataset]:
    statement = select(Dataset).where(Dataset.user_id == user_id)
    result = await db.execute(statement)
    return list(result.scalars().all())

async def create_dataset(
    db: AsyncSession,
    dataset_data: DatasetCreate,
) -> Dataset:
    dataset = Dataset(**dataset_data.model_dump())

    db.add(dataset)
    await db.commit()
    await db.refresh(dataset)

    return dataset


async def update_dataset_status(
    db: AsyncSession,
    dataset_id: uuid.UUID,
    upload_status: str,
) -> Dataset | None:
    dataset = await get_dataset_by_id(db, dataset_id)

    if dataset is None:
        return None

    dataset.upload_status = upload_status

    await db.commit()
    await db.refresh(dataset)

    return dataset
