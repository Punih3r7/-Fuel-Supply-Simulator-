from fastapi import APIRouter, HTTPException
from simulator.client import simulator, SimulatorUnavailable

router = APIRouter()


@router.get("/events")
async def get_events():
    try:
        return await simulator.get_events()
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable")
