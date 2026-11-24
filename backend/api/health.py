from fastapi import APIRouter
from simulator.client import simulator, SimulatorUnavailable

router = APIRouter()


@router.get("/health")
async def health():
    try:
        await simulator.get("/v1/health")
        sim_status = "ok"
    except SimulatorUnavailable:
        sim_status = "unavailable"

    return {
        "backend": "ok",
        "simulator": sim_status,
    }
