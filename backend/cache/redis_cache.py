"""
Redis cache layer - stores last known simulator state.
When the simulator goes down the backend serves from cache
instead of returning errors to the dashboard.
"""

import os
import json
import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
TTL = 300  # 5 minutes

_client = None


async def get_client():
    global _client
    if _client is None:
        _client = redis.from_url(REDIS_URL, decode_responses=True)
    return _client


async def set_cache(key: str, data) -> None:
    client = await get_client()
    await client.setex(key, TTL, json.dumps(data))


async def get_cache(key: str):
    client = await get_client()
    value = await client.get(key)
    if value is None:
        return None
    return json.loads(value)


async def invalidate(key: str) -> None:
    client = await get_client()
    await client.delete(key)
