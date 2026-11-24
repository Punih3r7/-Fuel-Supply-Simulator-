"""
Simulator client - talks to the BUP Fuel Supply Simulator REST API.
Handles retries and raises SimulatorUnavailable when the simulator
returns 503 so the resilience layer can activate the fallback.
"""

import os
import httpx
import asyncio

SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8000")
MAX_RETRIES = 3
RETRY_DELAY = 2.0


class SimulatorUnavailable(Exception):
    pass


class SimulatorClient:
    def __init__(self):
        self.base_url = SIMULATOR_URL
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=10.0)

    async def get(self, path: str, params: dict = None) -> dict | list:
        for attempt in range(MAX_RETRIES):
            try:
                r = await self.client.get(path, params=params)
                if r.status_code == 503:
                    raise SimulatorUnavailable(f"Simulator returned 503 on {path}")
                r.raise_for_status()
                return r.json()
            except SimulatorUnavailable:
                raise
            except Exception as e:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                else:
                    raise SimulatorUnavailable(str(e))

    async def post(self, path: str, body: dict) -> dict:
        for attempt in range(MAX_RETRIES):
            try:
                r = await self.client.post(path, json=body)
                if r.status_code == 503:
                    raise SimulatorUnavailable(f"Simulator returned 503 on {path}")
                r.raise_for_status()
                return r.json()
            except SimulatorUnavailable:
                raise
            except Exception as e:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                else:
                    raise SimulatorUnavailable(str(e))

    async def get_stations(self):
        return await self.get("/v1/stations")

    async def get_depots(self):
        return await self.get("/v1/depots")

    async def get_routes(self):
        return await self.get("/v1/routes")

    async def get_events(self):
        return await self.get("/v1/events")

    async def get_metrics(self):
        return await self.get("/v1/metrics")

    async def get_supply_arrivals(self):
        return await self.get("/v1/supply-arrivals")

    async def get_demand_history(self, station_id: str = None, limit: int = 96):
        params = {"limit": limit}
        if station_id:
            params["station_id"] = station_id
        return await self.get("/v1/demand-history", params=params)

    async def close(self):
        await self.client.aclose()


simulator = SimulatorClient()
