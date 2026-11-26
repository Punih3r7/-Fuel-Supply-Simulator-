from fastapi import APIRouter, HTTPException, Query
from simulator.client import simulator, SimulatorUnavailable
from resilience.fallback import with_fallback

router = APIRouter()


@router.get("/metrics")
async def get_metrics():
    try:
        return await simulator.get_metrics()
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable")


@router.get("/demand-history")
async def get_demand_history(station_id: str = None, limit: int = Query(default=48, le=200)):
    try:
        return await with_fallback(
            f"demand-history-{station_id}-{limit}",
            lambda: simulator.get_demand_history(station_id, limit),
        )
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable")
