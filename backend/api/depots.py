from fastapi import APIRouter, HTTPException
from simulator.client import simulator, SimulatorUnavailable
from resilience.fallback import with_fallback

router = APIRouter()


@router.get("/depots")
async def get_depots():
    try:
        return await with_fallback("depots", simulator.get_depots)
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable and no cache")


@router.get("/depots/{depot_id}")
async def get_depot(depot_id: str):
    try:
        depots = await with_fallback("depots", simulator.get_depots)
        depot = next((d for d in depots if d["id"] == depot_id), None)
        if not depot:
            raise HTTPException(status_code=404, detail="Depot not found")
        return depot
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable and no cache")
