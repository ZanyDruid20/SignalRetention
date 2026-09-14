from fastapi import Depends, HTTPException, status

from app.db.redis import redis_client
from app.dependencies.auth import get_current_user
from app.models.user import User

async def check_rate_limit(
    key: str,
    limit: int,
    window_seconds: int,
) -> None:
    if redis_client is None:
        return

    current_count = await redis_client.incr(key)

    if current_count == 1:
        await redis_client.expire(key, window_seconds)

    if current_count > limit:
        ttl = await redis_client.ttl(key)

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
            headers={
                "Retry-After": str(ttl if ttl > 0 else window_seconds),
            },
        )


def rate_limit(
    name: str,
    limit: int,
    window_seconds: int,
):
    async def dependency(
        current_user: User = Depends(get_current_user),
    ) -> None:
        client_identifier = f"user:{current_user.id}"
        key = f"rate_limit:{name}:{client_identifier}"

        await check_rate_limit(
            key=key,
            limit=limit,
            window_seconds=window_seconds,
        )

    return dependency
