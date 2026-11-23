"""
Monitoring agent - reads simulator state and raises shortage alerts.

Checks inventory at every station against recent demand.
If a station is running low on any fuel type it raises an alert
with an estimated hours-to-stockout so the forecaster can pick it up.
"""

import httpx
from dataclasses import dataclass

FUEL_TYPES = ["DIESEL", "PETROL", "OCTANE"]

LOW_INVENTORY_THRESHOLD = 0.25


@dataclass
class ShortageAlert:
    station_id: str
    station_name: str
    fuel_type: str
    current_inventory: float
    capacity: float
    fill_ratio: float
    active_events: list


class MonitoringAgent:
    def __init__(self, simulator_url: str):
        self.simulator_url = simulator_url
        self.client = httpx.AsyncClient(base_url=simulator_url, timeout=10.0)

    async def check(self) -> list[ShortageAlert]:
        stations = await self._get_stations()
        events = await self._get_active_events()
        alerts = []

        for station in stations:
            if station["status"] != "OPEN":
                continue

            for fuel in FUEL_TYPES:
                inventory = station["inventory"].get(fuel, 0)
                capacity = station["capacity"].get(fuel, 1)
                fill_ratio = inventory / capacity if capacity > 0 else 0

                if fill_ratio < LOW_INVENTORY_THRESHOLD:
                    alerts.append(ShortageAlert(
                        station_id=station["id"],
                        station_name=station["name"],
                        fuel_type=fuel,
                        current_inventory=inventory,
                        capacity=capacity,
                        fill_ratio=round(fill_ratio, 3),
                        active_events=[e for e in events if e["status"] == "ACTIVE"],
                    ))

        return alerts

    async def _get_stations(self) -> list:
        r = await self.client.get("/v1/stations")
        r.raise_for_status()
        return r.json()

    async def _get_active_events(self) -> list:
        r = await self.client.get("/v1/events")
        r.raise_for_status()
        return r.json()

    async def close(self):
        await self.client.aclose()
