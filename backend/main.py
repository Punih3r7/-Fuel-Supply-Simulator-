from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from api import stations, depots, alerts, metrics, events, decisions, health
from db.session import init_db

app = FastAPI(title="Fuel Supply Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(health.router)
app.include_router(stations.router)
app.include_router(depots.router)
app.include_router(alerts.router)
app.include_router(metrics.router)
app.include_router(events.router)
app.include_router(decisions.router)
