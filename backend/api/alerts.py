from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Alert
from resilience.metrics import alerts_detected

router = APIRouter()


@router.get("/alerts")
def get_alerts(resolved: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .filter(Alert.resolved == resolved)
        .order_by(Alert.created_at.desc())
        .limit(limit)
        .all()
    )
    for a in alerts:
        alerts_detected.labels(risk_level=a.risk_level).inc(0)
    return alerts


@router.post("/alerts/internal")
def create_alert(payload: dict, db: Session = Depends(get_db)):
    alert = Alert(**payload)
    db.add(alert)
    db.commit()
    alerts_detected.labels(risk_level=alert.risk_level).inc()
    return {"id": alert.id}


@router.post("/alerts/resolve")
def resolve_alerts(payload: dict, db: Session = Depends(get_db)):
    """Mark all unresolved alerts for a station+fuel as resolved."""
    station_id = payload.get("station_id")
    fuel_type   = payload.get("fuel_type")
    q = db.query(Alert).filter(Alert.resolved == 0)
    if station_id:
        q = q.filter(Alert.station_id == station_id)
    if fuel_type:
        q = q.filter(Alert.fuel_type == fuel_type)
    count = q.update({"resolved": 1})
    db.commit()
    return {"resolved": count}


@router.post("/alerts/clear-all")
def clear_all_alerts(db: Session = Depends(get_db)):
    """Mark every unresolved alert as resolved (use after simulator reset)."""
    count = db.query(Alert).filter(Alert.resolved == 0).update({"resolved": 1})
    db.commit()
    return {"resolved": count}
