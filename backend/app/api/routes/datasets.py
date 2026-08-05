import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limit import rate_limit
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.schemas.dataset import DatasetRead
from app.services.dataset_service import (
    get_user_dataset,
    list_datasets_for_user,
)
from app.services.upload_service import process_dataset_upload
from app.services.validation_service import MAX_UPLOAD_SIZE_MB

router = APIRouter()


@router.post(
    "/upload",
    response_model=DatasetRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("dataset_upload", 5, 600))],
)
async def upload_dataset(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dataset:
    max_size_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    content_type = file.content_type
    try:
        file_bytes = await file.read(max_size_bytes + 1)
    finally:
        await file.close()

    try:
        return await process_dataset_upload(
            db=db,
            current_user=current_user,
            filename=file.filename or "upload.csv",
            file_bytes=file_bytes,
            content_type=content_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@router.get("", response_model=list[DatasetRead])
async def list_datasets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Dataset]:
    return await list_datasets_for_user(db, current_user)

@router.get("/{dataset_id}", response_model=DatasetRead)
async def get_dataset(
    dataset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dataset:
    try:
        return await get_user_dataset(db, current_user, dataset_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
