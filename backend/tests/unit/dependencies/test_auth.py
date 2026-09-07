from unittest.mock import AsyncMock, Mock

import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import auth
from app.models.user import User
from app.schemas.auth import AuthUser


def bearer_credentials(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )


@pytest.mark.asyncio
async def test_get_current_user_rejects_missing_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    verify_mock = Mock()
    user_mock = AsyncMock()
    monkeypatch.setattr(auth, "verify_clerk_token", verify_mock)
    monkeypatch.setattr(auth, "get_or_create_user_from_auth", user_mock)

    with pytest.raises(HTTPException) as exc_info:
        await auth.get_current_user(bearer_credentials(""), db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Missing authentication token"
    assert exc_info.value.headers == {"WWW-Authenticate": "Bearer"}
    verify_mock.assert_not_called()
    user_mock.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_current_user_returns_authenticated_user(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    auth_user = AuthUser(
        clerk_user_id=test_user.clerk_user_id,
        email=test_user.email,
        name=test_user.name,
    )
    verify_mock = Mock(return_value=auth_user)
    user_mock = AsyncMock(return_value=test_user)
    monkeypatch.setattr(auth, "verify_clerk_token", verify_mock)
    monkeypatch.setattr(auth, "get_or_create_user_from_auth", user_mock)

    result = await auth.get_current_user(
        bearer_credentials("fake-valid-token"), db
    )

    assert result is test_user
    verify_mock.assert_called_once_with("fake-valid-token")
    user_mock.assert_awaited_once_with(db, auth_user)


@pytest.mark.asyncio
async def test_get_current_user_converts_jwt_error_to_unauthorized(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    verify_mock = Mock(side_effect=jwt.InvalidTokenError("invalid token"))
    user_mock = AsyncMock()
    monkeypatch.setattr(auth, "verify_clerk_token", verify_mock)
    monkeypatch.setattr(auth, "get_or_create_user_from_auth", user_mock)

    with pytest.raises(HTTPException) as exc_info:
        await auth.get_current_user(bearer_credentials("invalid-token"), db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid authentication credentials"
    assert exc_info.value.headers == {"WWW-Authenticate": "Bearer"}
    user_mock.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_current_user_converts_value_error_to_unauthorized(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    auth_user = AuthUser(clerk_user_id="user_test")
    monkeypatch.setattr(
        auth,
        "verify_clerk_token",
        Mock(return_value=auth_user),
    )
    monkeypatch.setattr(
        auth,
        "get_or_create_user_from_auth",
        AsyncMock(side_effect=ValueError("invalid user claims")),
    )

    with pytest.raises(HTTPException) as exc_info:
        await auth.get_current_user(bearer_credentials("invalid-claims"), db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid authentication credentials"
