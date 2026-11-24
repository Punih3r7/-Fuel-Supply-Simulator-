from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Alert

router = APIRouter()


@router.get("/alerts")
def get_alerts(resolved: int = 0, db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.resolved == resolved).order_by(Alert.created_at.desc()).all()
