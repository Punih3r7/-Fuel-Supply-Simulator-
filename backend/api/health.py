from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from simulator.client import simulator, SimulatorUnavailable
from resilience.circuit_breaker import circuit_breaker
from db.session import get_db
from db.models import Alert, Decision

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


@router.get("/system-status")
async def system_status(db: Session = Depends(get_db)):
    try:
        await simulator.get("/v1/health")
        sim_status = "ok"
    except SimulatorUnavailable:
        sim_status = "unavailable"

    active_alerts = db.query(Alert).filter(Alert.resolved == 0).count()
    total_decisions = db.query(Decision).count()
    critical_alerts = db.query(Alert).filter(Alert.resolved == 0, Alert.risk_level == "CRITICAL").count()

    return {
        "backend": "ok",
        "simulator": sim_status,
        "circuit_breaker": circuit_breaker.status(),
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "total_decisions": total_decisions,
    }
