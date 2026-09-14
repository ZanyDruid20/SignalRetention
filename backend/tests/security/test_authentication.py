from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import auth as auth_dependency
from app.services import auth_service


TEST_ISSUER = "https://clerk.security-test.invalid"


@pytest.fixture(scope="module")
def signing_keys():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    wrong_private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    return private_key, private_key.public_key(), wrong_private_key


@pytest.fixture(autouse=True)
def local_jwks(monkeypatch: pytest.MonkeyPatch, signing_keys) -> None:
    _, public_key, _ = signing_keys

    class LocalJWKClient:
        def __init__(self, url: str) -> None:
            assert url == f"{TEST_ISSUER}/.well-known/jwks.json"

        def get_signing_key_from_jwt(self, token: str):
            assert token
            return SimpleNamespace(key=public_key)

    monkeypatch.setattr(auth_service.settings, "clerk_issuer", TEST_ISSUER)
    monkeypatch.setattr(auth_service.jwt, "PyJWKClient", LocalJWKClient)


def make_token(
    private_key,
    *,
    omitted_claim: str | None = None,
    **claim_overrides,
) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        "sub": "clerk_user_security_test",
        "iss": TEST_ISSUER,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=5),
        "email": "security-test@example.com",
        "name": "Security Test",
    }
    claims.update(claim_overrides)
    if omitted_claim:
        claims.pop(omitted_claim)
    return jwt.encode(claims, private_key, algorithm="RS256")


def test_valid_rs256_token_is_accepted(signing_keys) -> None:
    private_key, _, _ = signing_keys

    result = auth_service.verify_clerk_token(make_token(private_key))

    assert result.clerk_user_id == "clerk_user_security_test"
    assert result.email == "security-test@example.com"
    assert result.name == "Security Test"


@pytest.mark.parametrize(
    ("claim_overrides", "expected_error"),
    [
        (
            {"exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
            jwt.ExpiredSignatureError,
        ),
        (
            {
                "iat": datetime.now(timezone.utc) + timedelta(minutes=1),
                "nbf": datetime.now(timezone.utc) + timedelta(minutes=1),
            },
            jwt.ImmatureSignatureError,
        ),
        ({"iss": "https://wrong-issuer.invalid"}, jwt.InvalidIssuerError),
    ],
)
def test_invalid_time_and_issuer_claims_are_rejected(
    signing_keys,
    claim_overrides: dict,
    expected_error: type[jwt.PyJWTError],
) -> None:
    private_key, _, _ = signing_keys

    with pytest.raises(expected_error):
        auth_service.verify_clerk_token(
            make_token(private_key, **claim_overrides)
        )


def test_token_signed_by_another_key_is_rejected(signing_keys) -> None:
    _, _, wrong_private_key = signing_keys

    with pytest.raises(jwt.InvalidSignatureError):
        auth_service.verify_clerk_token(make_token(wrong_private_key))


def test_non_rs256_algorithm_is_rejected() -> None:
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": "clerk_user_security_test",
            "iss": TEST_ISSUER,
            "iat": now,
            "exp": now + timedelta(minutes=5),
        },
        "not-a-real-clerk-secret-at-least-32-bytes-long",
        algorithm="HS256",
    )

    with pytest.raises(jwt.InvalidAlgorithmError):
        auth_service.verify_clerk_token(token)


@pytest.mark.parametrize("missing_claim", ["sub", "iat", "exp"])
def test_missing_required_claim_is_rejected(signing_keys, missing_claim: str) -> None:
    private_key, _, _ = signing_keys

    with pytest.raises(jwt.MissingRequiredClaimError):
        auth_service.verify_clerk_token(
            make_token(private_key, omitted_claim=missing_claim)
        )


@pytest.mark.asyncio
async def test_invalid_token_becomes_safe_401_without_token_disclosure(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    token = "sensitive-invalid-token-value"
    monkeypatch.setattr(
        auth_dependency,
        "verify_clerk_token",
        Mock(side_effect=jwt.InvalidTokenError("invalid signature")),
    )
    user_service = AsyncMock()
    monkeypatch.setattr(
        auth_dependency,
        "get_or_create_user_from_auth",
        user_service,
    )

    with pytest.raises(HTTPException) as exc_info:
        await auth_dependency.get_current_user(
            auth_dependency.HTTPAuthorizationCredentials(
                scheme="Bearer",
                credentials=token,
            ),
            AsyncMock(spec=AsyncSession),
        )

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid authentication credentials"
    assert exc_info.value.headers == {"WWW-Authenticate": "Bearer"}
    assert token not in caplog.text
    user_service.assert_not_awaited()
