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
from monitor.agent import MonitoringAgent
from forecaster.agent import ForecastingAgent
from allocator.agent import AllocationAgent


class Orchestrator:
    def __init__(self, mcp_url: str, backend_url: str):
        self.mcp_url = mcp_url
        self.backend_url = backend_url
        self.monitor = MonitoringAgent(mcp_url)
        self.forecaster = ForecastingAgent(mcp_url)
        self.allocator = AllocationAgent(mcp_url, backend_url)

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

        # Step 3: decide allocations and explain
        await self.allocator.decide(forecasts)

        await asyncio.sleep(5)


if __name__ == "__main__":
    import os
    mcp_url = os.getenv("MCP_URL", "http://localhost:8001")
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8080")
    asyncio.run(Orchestrator(mcp_url, backend_url).run())
