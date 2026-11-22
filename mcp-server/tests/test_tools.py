"""
Smoke tests for MCP server tools.
Requires simulator running at SIMULATOR_URL.
"""

import pytest
import httpx
import os

SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8000")


@pytest.fixture
def client():
    return httpx.Client(base_url=SIMULATOR_URL, timeout=5.0)


def test_health(client):
    r = client.get("/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"


def test_get_depots(client):
    r = client.get("/v1/depots")
    assert r.status_code == 200
    depots = r.json()
    assert len(depots) == 2
    ids = [d["id"] for d in depots]
    assert "depot-gazipur" in ids
    assert "depot-patiya" in ids


def test_get_stations(client):
    r = client.get("/v1/stations")
    assert r.status_code == 200
    stations = r.json()
    assert len(stations) == 4


def test_get_routes(client):
    r = client.get("/v1/routes")
    assert r.status_code == 200
    routes = r.json()
    assert len(routes) == 6


def test_get_metrics(client):
    r = client.get("/v1/metrics")
    assert r.status_code == 200
    m = r.json()
    assert "service_level" in m
    assert "unmet_demand_liters" in m
