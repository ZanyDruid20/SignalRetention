from fastapi import HTTPException, Request, status

from app.db.redis import redis_client


def get_client_identifier(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)

    if user_id:
        return f"user:{user_id}"

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
        return f"ip:{client_ip}"

    if request.client:
        return f"ip:{request.client.host}"

    return "ip:unknown"


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
    async def dependency(request: Request) -> None:
        client_identifier = get_client_identifier(request)
        key = f"rate_limit:{name}:{client_identifier}"

        await check_rate_limit(
            key=key,
            limit=limit,
            window_seconds=window_seconds,
        )

    return dependency
