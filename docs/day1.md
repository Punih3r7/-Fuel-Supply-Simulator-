# Day 1 - Nov 20 to 22

## Theme: Architecture + Project Skeleton + MCP Server Foundation

---

## What Was Done

### Architecture Design

full 6-layer system architecture:

```
Simulator -> MCP Server -> Claude Agents -> FastAPI Backend -> React Dashboard -> DevOps
```

Made the key decision to use Claude Code's agentic stack (MCP + Subagents) instead of a traditional ML pipeline. Claude itself reasons about fuel shortages and explains every decision in plain English. Documented all decisions in [architecture.md](architecture.md) and the 5-day delivery plan in [build-plan.md](build-plan.md).

### Project Skeleton

- Created full folder structure for all 6 layers
- Set up `.gitignore`, `.env.example`
- Built `docker-compose.yml` with the simulator and MCP server wired up
- Stubbed future services (backend, frontend, Prometheus, Grafana) as commented blocks - each gets enabled on its day

### MCP Server

Built the complete MCP server in [mcp-server/server.py](../mcp-server/server.py). Wrapped all 13 BUP simulator endpoints as Claude-callable tools:

| Tool | Simulator Endpoint | Purpose |
|---|---|---|
| `get_health()` | GET /v1/health | Liveness probe, bypasses faults |
| `get_instance()` | GET /v1/instance | Current tick, sim_time, status |
| `get_depots()` | GET /v1/depots | All depot inventory and capacity |
| `get_depot(id)` | GET /v1/depots/{id} | Single depot detail |
| `get_stations()` | GET /v1/stations | All station inventory and demand |
| `get_station(id)` | GET /v1/stations/{id} | Single station detail |
| `get_routes()` | GET /v1/routes | Availability, transit ticks, max shipment |
| `get_demand_history(station_id, limit)` | GET /v1/demand-history | Time-series for forecasting |
| `get_supply_arrivals()` | GET /v1/supply-arrivals | Upcoming fuel deliveries |
| `get_events()` | GET /v1/events | Active and scheduled crisis events |
| `get_allocations()` | GET /v1/allocations | Submitted allocation history |
| `get_metrics()` | GET /v1/metrics | Service level, allocation failures |
| `submit_allocation(...)` | POST /v1/allocations | The only write operation |
| `cancel_allocation(id)` | POST /v1/allocations/{id}/cancel | Cancel PENDING allocations |

Added smoke tests in [mcp-server/tests/test_tools.py](../mcp-server/tests/test_tools.py) and Dockerized the server.

---

## Files Added

```
README.md
docker-compose.yml
.gitignore
.env.example
docs/architecture.md
docs/build-plan.md
mcp-server/server.py
mcp-server/requirements.txt
mcp-server/Dockerfile
mcp-server/tests/test_tools.py
```

---

## Why This Approach

first of all we told to do the agentic labs from poridhi of claude thats why agentic approach intead of traditioanl ml pipeline

---

