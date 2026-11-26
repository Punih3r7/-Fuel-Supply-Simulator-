"""
Fallback layer - wraps simulator calls with cache fallback.
If the circuit is open or the simulator is unavailable,
serves the last cached state from Redis instead.
"""

import logging
from cache.redis_cache import get_cache, set_cache
from resilience.circuit_breaker import circuit_breaker
from resilience.metrics import fallback_activations, circuit_breaker_open
from simulator.client import SimulatorUnavailable

logger = logging.getLogger(__name__)


async def with_fallback(key: str, fetch_fn):
    circuit_breaker_open.set(1 if circuit_breaker.is_open() else 0)

    if circuit_breaker.is_open():
        logger.warning(f"Circuit open — serving cache for {key}")
        fallback_activations.inc()
        cached = await get_cache(key)
        if cached:
            return cached
        raise SimulatorUnavailable("Circuit open and no cache available")

    try:
        data = await fetch_fn()
        await set_cache(key, data)
        circuit_breaker.record_success()
        circuit_breaker_open.set(0)
        return data
    except SimulatorUnavailable as e:
        circuit_breaker.record_failure()
        circuit_breaker_open.set(1)
        fallback_activations.inc()
        logger.warning(f"Simulator failed ({e}) — trying cache for {key}")
        cached = await get_cache(key)
        if cached:
            return cached
        raise
