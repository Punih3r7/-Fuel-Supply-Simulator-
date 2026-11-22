# System Architecture

## Overview

The Fuel Supply Intelligence & Resilience Platform is a 6-layer system built on top of the BUP Fuel Supply Simulator. It uses Claude Code's agentic capabilities as the intelligence core, making it fundamentally different from a traditional ML pipeline approach.

## Layer 1 — BUP Fuel Supply Simulator (Provided)

The organizer-provided simulator models a small Bangladeshi fuel supply chain:

| Entity | Details |
|---|---|
| Regions | region-dhaka, region-chattogram |
| Depots | depot-gazipur (Dhaka), depot-patiya (Chattogram) |
| Stations | station-mirpur, station-tongi, station-karnaphuli, station-coxsbazar |
| Routes | 6 routes with 2–4 tick transit times |
| Fuel Types | DIESEL, PETROL, OCTANE |
| Tick | 15 simulated minutes per tick |

**Integration:** REST API on `http://localhost:8000` + SSE stream on `GET /v1/stream`

## Layer 2 — MCP Server

Wraps the simulator's REST API as Claude-callable tools using the Model Context Protocol (MCP).

**Why MCP?** Claude Code agents can only interact with the world through tools. The MCP server is the bridge between Claude's reasoning and the simulator's data.

### Tools Exposed

| Tool | Simulator Endpoint | Purpose |
|---|---|---|
| `get_health()` | GET /v1/health | Liveness check |
| `get_instance()` | GET /v1/instance | Current tick, sim_time, status |
| `get_depots()` | GET /v1/depots | Inventory, capacity, dispatch limits |
| `get_stations()` | GET /v1/stations | Inventory, demand multiplier, status |
| `get_routes()` | GET /v1/routes | Availability, transit ticks, max shipment |
| `get_inventory(depot_id)` | GET /v1/depots/{id} | Single depot detail |
| `get_demand_history(station_id, limit)` | GET /v1/demand-history | Time-series for forecasting |
| `get_supply_arrivals()` | GET /v1/supply-arrivals | Upcoming fuel deliveries |
| `get_events()` | GET /v1/events | Active and scheduled crisis events |
| `get_allocations()` | GET /v1/allocations | All submitted allocations |
| `get_metrics()` | GET /v1/metrics | Service level, allocation failures |
| `submit_allocation(depot, station, route, fuel, qty)` | POST /v1/allocations | The only write operation |
| `cancel_allocation(allocation_id)` | POST /v1/allocations/{id}/cancel | Cancel PENDING allocations |

## Layer 3 — Claude Code Orchestrator + Subagents

The intelligence layer. Three specialized subagents run under a main orchestrator.

### Main Orchestrator
- Coordinates the three subagents
- Manages the operational loop: Observe → Detect → Predict → Decide → Act → Monitor → Recover
- Writes decisions and explanations to the FastAPI backend

### Monitoring Agent
Responsibility: Know what is happening right now.
- Polls simulator state every N ticks via SSE + REST fallback
- Detects anomalies: unexpected inventory drops, demand spikes, route disruptions
- Raises shortage alerts when stockout probability exceeds threshold
- Publishes events to the backend

### Forecasting Agent
Responsibility: Know what will happen next.
- Reads demand history from `get_demand_history()`
- Calculates hours-to-stockout per station per fuel type
- Scores risk with confidence intervals (P10/P50/P90)
- Accounts for incoming supply arrivals from `get_supply_arrivals()`

### Allocation Agent
Responsibility: Decide what to do and explain why.
- Receives shortage alerts from Monitoring Agent
- Considers: depot inventory, route availability, dispatch capacity, station capacity
- Generates ranked allocation recommendations
- Produces plain-English explanation for every recommendation
- Submits approved allocations via `submit_allocation()`

## Layer 4 — FastAPI Backend

Your own REST API layer. The dashboard and observability stack talk to this, not directly to Claude or the simulator.

### Endpoints

```
GET  /health                    System health (backend + DB + Redis + simulator)
GET  /api/stations              Current station inventory + status
GET  /api/depots                Current depot inventory + status
GET  /api/alerts                Active shortage alerts
GET  /api/forecast              Stockout predictions per station/fuel
GET  /api/decisions             History of AI allocation decisions
GET  /api/decisions/{id}        Single decision with full AI reasoning
GET  /api/metrics               Service level, allocation stats
GET  /api/events                Active crisis events
POST /api/allocations           Trigger an allocation (goes through agent)
```

### Resilience Patterns
- **Circuit Breaker:** If simulator returns 503 N times in a row, open the circuit and serve Redis cache
- **Retry with Backoff:** Exponential backoff + jitter on 503 responses
- **Degraded Mode:** When ML/agent unavailable, fall back to rule-based allocation (inventory / demand_rate = hours_remaining)
- **Cache Invalidation:** Watch for `X-Simulator-Stale: true` header and invalidate Redis cache

## Layer 5 — React Operator Dashboard

Operator-facing web application. Calls the FastAPI backend only.

### Views
- **Network Overview:** Map/grid of all depots and stations with live inventory levels
- **Shortage Alerts:** Sorted by urgency, with projected stockout time
- **AI Recommendations:** Each recommendation shows the full AI reasoning
- **Decision History:** Audit trail of all allocations with outcomes
- **Crisis Events:** Active events injected by organizers
- **System Health:** Status of backend, DB, Redis, simulator, agent

## Layer 6 — DevOps + Observability

### docker-compose.yml Services
1. `simulator` — BUP Fuel Supply Simulator (organizer image)
2. `mcp-server` — MCP server wrapping simulator API
3. `backend` — FastAPI application
4. `postgres` — PostgreSQL 16 database
5. `redis` — Redis 7 cache
6. `frontend` — React app served via Nginx
7. `prometheus` — Metrics collection
8. `grafana` — Dashboards and alerting

### Observability Layers
| Layer | Tool | What It Tracks |
|---|---|---|
| Application | Prometheus | Request rate, latency, error rate |
| System | Prometheus node exporter | CPU, memory, disk |
| Intelligence | Custom metrics | Allocation decisions/min, forecast confidence, fallback activations |
| Logs | Loki + structured JSON | Every allocation, every anomaly, every fallback |
| Alerts | Grafana alerting | Stockout risk > 80%, error rate > 5%, simulator unreachable |

## Key Design Decisions

**Why Claude agents instead of a traditional ML pipeline?**
Traditional pipelines (LightGBM → PuLP → allocate) produce numbers but cannot explain their reasoning. Claude agents produce decisions AND plain-English explanations visible to operators. This matches the judge requirement: "Human operators should remain able to inspect important decisions."

**Why MCP?**
MCP is the standard protocol for connecting Claude to external tools. Building an MCP server for the simulator means Claude agents can call simulator endpoints as naturally as calling a function.

**Why Redis as fallback?**
When the simulator returns 503 (fault injected), the system must continue operating. Redis holds the last known good state, allowing the backend and dashboard to remain functional in degraded mode.

**Why PostgreSQL for decision history?**
Every allocation recommendation (with full AI reasoning text) is stored permanently. This creates the audit trail judges look for in the demo.
