from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.user import User
from app.services.dataset_service import (
    create_dataset_for_user,
    update_user_dataset_status,
)
from app.services.validation_service import validate_upload_file

async def process_dataset_upload(
    db: AsyncSession,
    current_user: User,
    filename: str,
    file_bytes: bytes,
) -> Dataset:
    validate_upload_file(filename, file_bytes)
    dataset = await create_dataset_for_user(
        db=db,
        current_user=current_user,
        name=filename,
        filename=filename,
    )
    update_dataset = await update_user_dataset_status(
        db=db,
        current_user=current_user,
        dataset_id=dataset.id,
        upload_status="processing"
    )
    return update_dataset