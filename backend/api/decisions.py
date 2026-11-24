from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Decision

router = APIRouter()


@router.get("/decisions")
def get_decisions(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Decision).order_by(Decision.created_at.desc()).limit(limit).all()


@router.get("/decisions/{decision_id}")
def get_decision(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        return {"error": "not found"}
    return decision
