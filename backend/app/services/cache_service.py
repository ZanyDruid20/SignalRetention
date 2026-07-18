import redis.asyncio as redis
from app.core.config import settings

redis_client = (
    redis.from_url(settings.redis_url, decode_responses=True)
    if settings.redis_url
    else None
)

async def get_cache(key: str) -> str | None:
    if not key:
        raise ValueError("Cache key is required")
    if redis_client is None:
        return None
    value = await redis_client.get(key)
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return value

async def set_cache(
    key: str, value: str, ttl_seconds: int = 300) -> None:
    if not key:
        raise ValueError("Cache key is required")
    if redis_client is None:
        return None
    await redis_client.set(
        key,
        value,
        ex=ttl_seconds,
    )

async def delete_cache(key: str) -> None:
    if not key:
        raise ValueError("Cache key is required")
    if redis_client is None:
        return None
    await redis_client.delete(key)
