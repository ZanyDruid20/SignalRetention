import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate


async def get_user_by_id(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> User | None:
    statement = select(User).where(User.id == user_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def get_user_by_clerk_user_id(
    db: AsyncSession,
    clerk_user_id: str,
) -> User | None:
    statement = select(User).where(User.clerk_user_id == clerk_user_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    user_data: UserCreate,
) -> User:
    user = User(**user_data.model_dump())

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


async def get_or_create_user(
    db: AsyncSession,
    user_data: UserCreate,
) -> User:
    existing_user = await get_user_by_clerk_user_id(
        db,
        user_data.clerk_user_id,
    )

    if existing_user is not None:
        return existing_user

    return await create_user(db, user_data)

