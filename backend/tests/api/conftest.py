import uuid
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest_asyncio
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.main import app
from app.models.user import User
from app.core import rate_limit as rate_limit_module


@pytest.fixture(autouse=True)
def disable_external_redis(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(rate_limit_module, "redis_client", None)


def api_user() -> User:
    now = datetime.now(timezone.utc)
    return User(
        id=uuid.uuid4(),
        clerk_user_id="user_api_test",
        email="api-test@example.com",
        name="API Test User",
        created_at=now,
        updated_at=now,
    )


@pytest_asyncio.fixture
async def db_mock() -> AsyncMock:
    return AsyncMock(spec=AsyncSession)


@pytest_asyncio.fixture
async def authenticated_user() -> User:
    return api_user()


@pytest_asyncio.fixture
async def client(
    db_mock: AsyncMock,
    authenticated_user: User,
) -> AsyncIterator[AsyncClient]:
    async def override_get_db() -> AsyncIterator[AsyncMock]:
        yield db_mock

    async def override_get_current_user() -> User:
        return authenticated_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def unauthenticated_client() -> AsyncIterator[AsyncClient]:
    app.dependency_overrides.clear()
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
