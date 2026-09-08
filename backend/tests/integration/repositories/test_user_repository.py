import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import (
    create_user,
    get_or_create_user,
    get_user_by_clerk_user_id,
    get_user_by_id,
)
from app.schemas.user import UserCreate


def user_data(suffix: str) -> UserCreate:
    return UserCreate(
        clerk_user_id=f"clerk_{suffix}_{uuid.uuid4()}",
        email=f"{suffix}_{uuid.uuid4()}@example.com",
        name=f"User {suffix}",
    )


@pytest.mark.asyncio
async def test_create_and_find_user(db_session: AsyncSession) -> None:
    data = user_data("create")
    created = await create_user(db_session, data)

    assert await get_user_by_id(db_session, created.id) is created
    assert await get_user_by_clerk_user_id(db_session, data.clerk_user_id) is created
    assert await get_user_by_id(db_session, uuid.uuid4()) is None
    assert await get_user_by_clerk_user_id(db_session, "missing") is None


@pytest.mark.asyncio
async def test_get_or_create_user_is_idempotent(db_session: AsyncSession) -> None:
    data = user_data("idempotent")

    first = await get_or_create_user(db_session, data)
    second = await get_or_create_user(db_session, data)

    assert second.id == first.id
    assert second.clerk_user_id == first.clerk_user_id
