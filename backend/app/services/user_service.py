from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user_repository import get_or_create_user
from app.schemas.auth import AuthUser
from app.schemas.user import UserCreate

async def get_or_create_user_from_auth(
    db: AsyncSession,
    auth_user: AuthUser,
) -> User:
    if auth_user.email is None:
        raise ValueError("User is missing an email address")
    user_data = UserCreate(
        clerk_user_id=auth_user.clerk_user_id,
        email=auth_user.email,
        name=auth_user.name or auth_user.email,
    )
    return await get_or_create_user(db, user_data)