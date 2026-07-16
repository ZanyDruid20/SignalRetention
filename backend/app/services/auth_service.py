import jwt

from app.core.config import settings
from app.schemas.auth import AuthTokenPayload, AuthUser


def verify_clerk_token(token: str) -> AuthUser:
    jwks_url = f"{settings.clerk_issuer}/.well-known/jwks.json"

    jwks_client = jwt.PyJWKClient(jwks_url)
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer=settings.clerk_issuer,
        options={"verify_aud": False},
    )

    token_payload = AuthTokenPayload(
        sub=payload["sub"],
        email=payload.get("email"),
        name=payload.get("name"),
    )

    return AuthUser(
        clerk_user_id=token_payload.sub,
        email=token_payload.email,
        name=token_payload.name,
    )