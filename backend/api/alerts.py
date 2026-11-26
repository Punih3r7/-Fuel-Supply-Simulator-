from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Alert
from resilience.metrics import alerts_detected

router = APIRouter()


@router.get("/alerts")
def get_alerts(resolved: int = 0, db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.resolved == resolved).order_by(Alert.created_at.desc()).all()
    for a in alerts:
        alerts_detected.labels(risk_level=a.risk_level).inc(0)  # ensure label exists
    return alerts


@router.post("/alerts/internal")
def create_alert(payload: dict, db: Session = Depends(get_db)):
    alert = Alert(**payload)
    db.add(alert)
    db.commit()
    alerts_detected.labels(risk_level=alert.risk_level).inc()
    return {"id": alert.id}
