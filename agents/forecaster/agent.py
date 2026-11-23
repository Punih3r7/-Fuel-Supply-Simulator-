"""
Forecasting agent - calculates hours to stockout per station per fuel type.

Takes shortage alerts from the monitoring agent, pulls recent demand history,
and works out how long each station has before it runs dry.
"""

import httpx
from dataclasses import dataclass

TICKS_PER_HOUR = 4  # 15 min ticks = 4 per hour
HISTORY_LIMIT = 48  # last 12 simulated hours


@dataclass
class StockoutForecast:
    station_id: str
    station_name: str
    fuel_type: str
    current_inventory: float
    avg_demand_per_tick: float
    hours_to_stockout: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL


class ForecastingAgent:
    def __init__(self, simulator_url: str):
        self.simulator_url = simulator_url
        self.client = httpx.AsyncClient(base_url=simulator_url, timeout=10.0)

    async def forecast(self, alerts: list) -> list[StockoutForecast]:
        forecasts = []
        for alert in alerts:
            history = await self._get_demand_history(alert.station_id, alert.fuel_type)
            avg_demand = self._avg_demand(history)

            if avg_demand <= 0:
                continue

            ticks_remaining = alert.current_inventory / avg_demand
            hours_remaining = ticks_remaining / TICKS_PER_HOUR

            forecasts.append(StockoutForecast(
                station_id=alert.station_id,
                station_name=alert.station_name,
                fuel_type=alert.fuel_type,
                current_inventory=alert.current_inventory,
                avg_demand_per_tick=round(avg_demand, 2),
                hours_to_stockout=round(hours_remaining, 1),
                risk_level=self._risk_level(hours_remaining),
            ))

        forecasts.sort(key=lambda f: f.hours_to_stockout)
        return forecasts

    def _avg_demand(self, history: list) -> float:
        if not history:
            return 0
        total = sum(row.get("demand_liters", 0) for row in history)
        return total / len(history)

    def _risk_level(self, hours: float) -> str:
        if hours < 3:
            return "CRITICAL"
        if hours < 8:
            return "HIGH"
        if hours < 24:
            return "MEDIUM"
        return "LOW"

    async def _get_demand_history(self, station_id: str, fuel_type: str) -> list:
        r = await self.client.get(
            "/v1/demand-history",
            params={"station_id": station_id, "limit": HISTORY_LIMIT}
        )
        r.raise_for_status()
        data = r.json()
        return [row for row in data if row.get("fuel_type") == fuel_type]

    async def close(self):
        await self.client.aclose()
