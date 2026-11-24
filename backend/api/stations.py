from fastapi import APIRouter, HTTPException
from simulator.client import simulator, SimulatorUnavailable

router = APIRouter()


@router.get("/stations")
async def get_stations():
    try:
        return await simulator.get_stations()
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable")


@router.get("/stations/{station_id}")
async def get_station(station_id: str):
    try:
        stations = await simulator.get_stations()
        station = next((s for s in stations if s["id"] == station_id), None)
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")
        return station
    except SimulatorUnavailable:
        raise HTTPException(status_code=503, detail="Simulator unavailable")
