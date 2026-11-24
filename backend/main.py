from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import stations, depots, alerts, metrics, events, decisions, health

app = FastAPI(title="Fuel Supply Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(stations.router, prefix="/api")
app.include_router(depots.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(decisions.router, prefix="/api")
