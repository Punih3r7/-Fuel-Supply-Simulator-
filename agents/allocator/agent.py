"""
Allocation agent - decides what to send where and explains why.

Takes forecasts from the forecasting agent, finds the best available
route for each at-risk station, calculates a safe dispatch quantity,
and submits the allocation to the simulator with a plain-English explanation.
"""

import uuid
import httpx
from dataclasses import dataclass


@dataclass
class AllocationDecision:
    station_id: str
    station_name: str
    fuel_type: str
    depot_id: str
    route_id: str
    quantity: float
    explanation: str
    idempotency_key: str


class AllocationAgent:
    def __init__(self, simulator_url: str, backend_url: str = None):
        self.simulator_url = simulator_url
        self.backend_url = backend_url
        self.client = httpx.AsyncClient(base_url=simulator_url, timeout=10.0)

    async def decide(self, forecasts: list) -> list[AllocationDecision]:
        depots = await self._get_depots()
        routes = await self._get_routes()
        decisions = []

        for forecast in forecasts:
            if forecast.risk_level not in ("CRITICAL", "HIGH"):
                continue

            route, depot = self._best_route(
                forecast.station_id, forecast.fuel_type, depots, routes
            )
            if not route or not depot:
                continue

            quantity = self._safe_quantity(forecast, depot, route)
            if quantity <= 0:
                continue

            explanation = self._explain(forecast, depot, route, quantity)
            key = f"alloc-{forecast.station_id}-{forecast.fuel_type}-{uuid.uuid4().hex[:8]}"

            decision = AllocationDecision(
                station_id=forecast.station_id,
                station_name=forecast.station_name,
                fuel_type=forecast.fuel_type,
                depot_id=depot["id"],
                route_id=route["id"],
                quantity=quantity,
                explanation=explanation,
                idempotency_key=key,
            )

            submitted = await self._submit(decision)
            if submitted:
                decisions.append(decision)

        return decisions

    def _best_route(self, station_id, fuel_type, depots, routes):
        available = [
            r for r in routes
            if r["destination_station_id"] == station_id
            and r["status"] == "AVAILABLE"
        ]
        if not available:
            return None, None

        available.sort(key=lambda r: r["transit_ticks"])
        route = available[0]

        depot = next(
            (d for d in depots
             if d["id"] == route["source_depot_id"]
             and d["status"] in ("OPEN", "CONSTRAINED")
             and d["inventory"].get(fuel_type, 0) > 0),
            None
        )
        return route, depot

    def _safe_quantity(self, forecast, depot, route) -> float:
        depot_stock = depot["inventory"].get(forecast.fuel_type, 0)
        max_shipment = route["max_shipment"]
        dispatch_cap = depot.get("dispatch_capacity_per_tick", max_shipment)
        return min(depot_stock * 0.5, max_shipment, dispatch_cap)

    def _explain(self, forecast, depot, route, quantity) -> str:
        return (
            f"{forecast.station_name} has {forecast.current_inventory:.0f}L of "
            f"{forecast.fuel_type} remaining. At current demand of "
            f"{forecast.avg_demand_per_tick:.1f}L per tick, stockout in "
            f"{forecast.hours_to_stockout:.1f} hours. "
            f"Dispatching {quantity:.0f}L from {depot['name']} via "
            f"{route['id']} ({route['transit_ticks']} ticks transit). "
            f"Risk level: {forecast.risk_level}."
        )

    async def _get_depots(self) -> list:
        r = await self.client.get("/v1/depots")
        r.raise_for_status()
        return r.json()

    async def _get_routes(self) -> list:
        r = await self.client.get("/v1/routes")
        r.raise_for_status()
        return r.json()

    async def _submit(self, decision: AllocationDecision) -> bool:
        try:
            r = await self.client.post("/v1/allocations", json={
                "idempotency_key": decision.idempotency_key,
                "source_depot_id": decision.depot_id,
                "destination_station_id": decision.station_id,
                "route_id": decision.route_id,
                "fuel_type": decision.fuel_type,
                "quantity": decision.quantity,
            })
            return r.status_code in (200, 201)
        except Exception as e:
            print(f"Allocation failed: {e}")
            return False

    async def close(self):
        await self.client.aclose()
