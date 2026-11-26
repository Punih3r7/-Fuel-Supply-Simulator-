import asyncio
import logging
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from api import stations, depots, alerts, metrics, events, decisions, health
from db.session import init_db

logger = logging.getLogger(__name__)

SIMULATOR_URL = __import__('os').getenv("SIMULATOR_URL", "http://simulator:8000")
TICK_INTERVAL = 30  # seconds between simulation ticks

app = FastAPI(title="Fuel Supply Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

async def _ticker():
    """Advances the simulator one tick every TICK_INTERVAL seconds."""
    await asyncio.sleep(5)  # give simulator time to be ready
    async with httpx.AsyncClient(base_url=SIMULATOR_URL, timeout=10) as client:
        # ensure simulator is paused (not in runaway mode)
        try:
            await client.post("/admin/pause")
        except Exception:
            pass
        while True:
            try:
                await client.post("/admin/step")
            except Exception as e:
                logger.warning(f"Ticker step failed: {e}")
            await asyncio.sleep(TICK_INTERVAL)

@app.on_event("startup")
async def on_startup():
    init_db()
    asyncio.create_task(_ticker())

app.include_router(health.router)
app.include_router(stations.router)
app.include_router(depots.router)
app.include_router(alerts.router)
app.include_router(metrics.router)
app.include_router(events.router)
app.include_router(decisions.router)
