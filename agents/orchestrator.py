"""
Main orchestrator — coordinates the three subagents.

Operational loop:
    Observe -> Detect -> Predict -> Decide -> Act -> Monitor -> Recover

Each cycle:
1. Monitoring agent reads current simulator state and raises alerts
2. Healthy station/fuel combos get their open alerts resolved
3. Forecasting agent calculates stockout risk per station per fuel
4. Allocation agent decides what to send where and explains why
"""

import asyncio
import httpx
from monitor.agent import MonitoringAgent, FUEL_TYPES, LOW_INVENTORY_THRESHOLD
from forecaster.agent import ForecastingAgent
from allocator.agent import AllocationAgent


class Orchestrator:
    def __init__(self, simulator_url: str, backend_url: str):
        self.simulator_url = simulator_url
        self.backend_url = backend_url
        self.monitor = MonitoringAgent(simulator_url)
        self.forecaster = ForecastingAgent(simulator_url)
        self.allocator = AllocationAgent(simulator_url, backend_url)

    async def run(self):
        print("Orchestrator started.", flush=True)
        while True:
            try:
                await self._cycle()
            except Exception as e:
                print(f"Cycle error: {e} — retrying in 10s", flush=True)
                await asyncio.sleep(10)

    async def _cycle(self):
        # Step 1: get current station state
        stations = await self.monitor._get_stations()

        # Step 2: resolve alerts for stations that have recovered
        await self._resolve_recovered(stations)

        # Step 3: detect shortages
        alerts = await self.monitor.check()

        if not alerts:
            await asyncio.sleep(5)
            return

        # Step 4: forecast risk
        forecasts = await self.forecaster.forecast(alerts)

        # Step 5: save alerts to backend
        await self._save_alerts(forecasts)

        # Step 6: decide allocations
        decisions = await self.allocator.decide(forecasts)

        # Step 7: save decisions to backend
        await self._save_decisions(decisions)

        await asyncio.sleep(5)

    async def _resolve_recovered(self, stations):
        """Mark alerts as resolved for any station/fuel now above the threshold."""
        async with httpx.AsyncClient(base_url=self.backend_url, timeout=5.0) as client:
            for station in stations:
                for fuel in FUEL_TYPES:
                    inv = station["inventory"].get(fuel, 0)
                    cap = station["capacity"].get(fuel, 1)
                    fill = inv / cap if cap else 0
                    if fill >= LOW_INVENTORY_THRESHOLD:
                        try:
                            await client.post("/alerts/resolve", json={
                                "station_id": station["id"],
                                "fuel_type": fuel,
                            })
                        except Exception:
                            pass

    async def _save_alerts(self, forecasts):
        async with httpx.AsyncClient(base_url=self.backend_url, timeout=5.0) as client:
            for f in forecasts:
                try:
                    await client.post("/alerts/internal", json={
                        "station_id": f.station_id,
                        "station_name": f.station_name,
                        "fuel_type": f.fuel_type,
                        "current_inventory": f.current_inventory,
                        "hours_to_stockout": f.hours_to_stockout,
                        "risk_level": f.risk_level,
                    })
                except Exception as e:
                    print(f"Failed to save alert: {e}", flush=True)

    async def _save_decisions(self, decisions):
        async with httpx.AsyncClient(base_url=self.backend_url, timeout=5.0) as client:
            for d in decisions:
                try:
                    await client.post("/decisions/internal", json={
                        "station_id": d.station_id,
                        "station_name": d.station_name,
                        "fuel_type": d.fuel_type,
                        "depot_id": d.depot_id,
                        "route_id": d.route_id,
                        "quantity": d.quantity,
                        "explanation": d.explanation,
                        "idempotency_key": d.idempotency_key,
                    })
                except Exception as e:
                    print(f"Failed to save decision: {e}", flush=True)


if __name__ == "__main__":
    import os
    simulator_url = os.getenv("SIMULATOR_URL", "http://localhost:8000")
    backend_url   = os.getenv("BACKEND_URL",   "http://localhost:8080")
    asyncio.run(Orchestrator(simulator_url, backend_url).run())
