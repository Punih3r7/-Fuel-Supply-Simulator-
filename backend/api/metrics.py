from fastapi import APIRouter, HTTPException
from simulator.client import simulator, SimulatorUnavailable

router = APIRouter()


@router.get("/metrics")
async def get_metrics():
    try:
        return await simulator.get_metrics()
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable")
