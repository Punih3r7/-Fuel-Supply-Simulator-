"""
Main orchestrator — coordinates the three subagents.

Operational loop:
    Observe -> Detect -> Predict -> Decide -> Act -> Monitor -> Recover

Each cycle:
1. Monitoring agent reads current simulator state and raises alerts
2. Forecasting agent calculates stockout risk per station per fuel
3. Allocation agent decides what to send where and explains why
"""

import asyncio
import httpx
from monitor.agent import MonitoringAgent
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
        """Main loop. Runs continuously until stopped."""
        print("Orchestrator started.")
        while True:
            try:
                await self._cycle()
            except Exception as e:
                print(f"Cycle error: {e} — retrying in 10s")
                await asyncio.sleep(10)

    async def _cycle(self):
        # Step 1: observe current state
        alerts = await self.monitor.check()

        if not alerts:
            await asyncio.sleep(5)
            return

        # Step 2: forecast risk for each alert
        forecasts = await self.forecaster.forecast(alerts)

        # Step 3: save alerts to backend
        await self._save_alerts(forecasts)

        # Step 4: decide allocations and explain
        decisions = await self.allocator.decide(forecasts)

        # Step 5: save decisions to backend
        await self._save_decisions(decisions)

        await asyncio.sleep(5)

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
                    print(f"Failed to save alert: {e}")

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
                    print(f"Failed to save decision: {e}")


if __name__ == "__main__":
    import os
    simulator_url = os.getenv("SIMULATOR_URL", "http://localhost:8000")
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8080")
    asyncio.run(Orchestrator(simulator_url, backend_url).run())
