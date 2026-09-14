import pytest
from httpx import AsyncClient

from app.models.user import User


@pytest.mark.asyncio
async def test_auth_me_returns_authenticated_user(
    client: AsyncClient,
    authenticated_user: User,
) -> None:
    response = await client.get("/auth/me")

    assert response.status_code == 200
    assert response.json()["id"] == str(authenticated_user.id)
    assert response.json()["clerk_user_id"] == authenticated_user.clerk_user_id
    assert response.json()["email"] == authenticated_user.email


@pytest.mark.asyncio
async def test_auth_me_rejects_missing_bearer_token(
    unauthenticated_client: AsyncClient,
) -> None:
    response = await unauthenticated_client.get("/auth/me")

    assert response.status_code == 401


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "authorization",
    [
        "Basic credentials",
        "Bearer",
        "NotBearer malformed-token",
    ],
)
async def test_auth_me_rejects_malformed_authorization_headers(
    unauthenticated_client: AsyncClient,
    authorization: str,
) -> None:
    response = await unauthenticated_client.get(
        "/auth/me",
        headers={"Authorization": authorization},
    )

    assert response.status_code == 401
    assert "token" not in response.text.lower()


@pytest.mark.asyncio
async def test_api_responses_include_security_and_request_headers(
    client: AsyncClient,
) -> None:
    response = await client.get("/auth/me")

    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "x-request-id" in response.headers
