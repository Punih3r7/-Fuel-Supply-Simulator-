"""
MCP Server — BUP Fuel Supply Simulator Tools

Wraps the BUP Fuel Supply Simulator REST API as Claude-callable MCP tools.
Claude agents call these tools to read simulator state and submit allocations.

Simulator base URL: http://localhost:8000
"""

import os
import httpx
from mcp.server.fastmcp import FastMCP

SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8000")

mcp = FastMCP("bup-fuel-simulator")

client = httpx.AsyncClient(base_url=SIMULATOR_URL, timeout=10.0)


# ---------------------------------------------------------------------------
# READ tools — simulator state
# ---------------------------------------------------------------------------

@mcp.tool()
async def get_health() -> dict:
    """Check simulator health. Use as liveness probe. Bypasses fault injection."""
    r = await client.get("/v1/health")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_instance() -> dict:
    """Get current simulation instance: tick, sim_time, status (PAUSED/RUNNING)."""
    r = await client.get("/v1/instance")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_depots() -> list:
    """Get all depots with current inventory, capacity, and dispatch limits."""
    r = await client.get("/v1/depots")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_depot(depot_id: str) -> dict:
    """Get a single depot by ID with full inventory detail."""
    r = await client.get(f"/v1/depots/{depot_id}")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_stations() -> list:
    """Get all fuel stations with inventory, demand multiplier, and status."""
    r = await client.get("/v1/stations")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_station(station_id: str) -> dict:
    """Get a single station by ID with full inventory detail."""
    r = await client.get(f"/v1/stations/{station_id}")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_routes() -> list:
    """Get all routes with availability, transit ticks, and max shipment size."""
    r = await client.get("/v1/routes")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_demand_history(station_id: str = None, limit: int = 96) -> list:
    """
    Get time-series demand observations for forecasting.
    limit is clamped to [1, 2000], default 96 (last 24 simulated hours at 15min ticks).
    Filter by station_id for per-station forecasting.
    """
    params = {"limit": limit}
    if station_id:
        params["station_id"] = station_id
    r = await client.get("/v1/demand-history", params=params)
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_supply_arrivals() -> list:
    """Get scheduled and delayed supply arrivals at depots."""
    r = await client.get("/v1/supply-arrivals")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_events() -> list:
    """Get all crisis events (SCHEDULED, ACTIVE, RESOLVED)."""
    r = await client.get("/v1/events")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_allocations() -> list:
    """Get all allocations submitted by this application."""
    r = await client.get("/v1/allocations")
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def get_metrics() -> dict:
    """
    Get aggregated ground-truth metrics since simulation start.
    Returns: served_demand_liters, unmet_demand_liters, service_level, allocation_failures.
    service_level = served / (served + unmet). 1.0 = zero unmet demand.
    """
    r = await client.get("/v1/metrics")
    r.raise_for_status()
    return r.json()


# ---------------------------------------------------------------------------
# WRITE tool — the only domain mutation
# ---------------------------------------------------------------------------

@mcp.tool()
async def submit_allocation(
    idempotency_key: str,
    source_depot_id: str,
    destination_station_id: str,
    route_id: str,
    fuel_type: str,
    quantity: float,
) -> dict:
    """
    Submit a fuel allocation from a depot to a station.

    This is the ONLY write operation. All other tools are read-only.

    Args:
        idempotency_key: Unique key (1-150 chars). Same key + same body = safe retry.
        source_depot_id: Must exist in get_depots(). E.g. 'depot-gazipur'
        destination_station_id: Must exist in get_stations(). E.g. 'station-mirpur'
        route_id: Must exist in get_routes() and connect depot to station.
        fuel_type: One of DIESEL, PETROL, OCTANE
        quantity: Litres to dispatch. Must be > 0 and <= route max_shipment.

    Returns 201 on success. Common 409 errors:
        INSUFFICIENT_INVENTORY, ROUTE_DISRUPTED, DESTINATION_CAPACITY_EXCEEDED,
        DISPATCH_CAPACITY_EXCEEDED, STATION_CLOSED, DEPOT_CLOSED
    """
    payload = {
        "idempotency_key": idempotency_key,
        "source_depot_id": source_depot_id,
        "destination_station_id": destination_station_id,
        "route_id": route_id,
        "fuel_type": fuel_type,
        "quantity": quantity,
    }
    r = await client.post("/v1/allocations", json=payload)
    r.raise_for_status()
    return r.json()


@mcp.tool()
async def cancel_allocation(allocation_id: int) -> dict:
    """
    Cancel a PENDING allocation. Refunds depot inventory.
    Only works if status == PENDING. Returns 409 CANNOT_CANCEL if already in transit.
    """
    r = await client.post(f"/v1/allocations/{allocation_id}/cancel")
    r.raise_for_status()
    return r.json()


if __name__ == "__main__":
    mcp.run()
