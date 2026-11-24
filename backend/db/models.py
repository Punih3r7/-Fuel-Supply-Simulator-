from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True)
    station_id = Column(String, nullable=False)
    station_name = Column(String, nullable=False)
    fuel_type = Column(String, nullable=False)
    depot_id = Column(String, nullable=False)
    route_id = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    idempotency_key = Column(String, unique=True, nullable=False)
    status = Column(String, default="SUBMITTED")
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    station_id = Column(String, nullable=False)
    station_name = Column(String, nullable=False)
    fuel_type = Column(String, nullable=False)
    current_inventory = Column(Float, nullable=False)
    hours_to_stockout = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    resolved = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
