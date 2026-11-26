# Fuel Supply Intelligence & Resilience Platform

> **BUP CSE FEST 2026 — Final Hackathon** | In association with Poridhi.io
> Build. Deploy. Observe. Respond.

An intelligent, agentic fuel supply operations platform built on top of the BUP Fuel Supply Simulator. Uses **Claude Code's agentic capabilities** (MCP Server + Subagents) to monitor, forecast, decide, and explain fuel allocation decisions across Bangladesh's simulated supply network.

---

## Build Progress

| Day | Date | Status | What Was Built | Notes |
|-----|------|--------|----------------|-------|
| Day 1 | Nov 20 - 22 | Done | Architecture design, project skeleton, MCP server foundation | [View details](docs/day1.md) |
| Day 2 | Nov 23 | Done | Claude agents - monitor, forecast, allocate subagents | [View details](docs/day2.md) |
| Day 3 | Nov 24 | Done | FastAPI backend + PostgreSQL + Redis resilience layer | [View details](docs/day3.md) |
| Day 4 | Nov 25 | Done | React operator dashboard + Prometheus/Grafana observability | [View details](docs/day4.md) |
| Day 5 | Nov 26 | Done | Load testing + CI/CD + final demo polish | [View details](docs/day5.md) |

---

## What This System Does

- **Observes** real-time fuel inventory across 2 depots and 4 stations
- **Detects** emerging shortages and demand anomalies via SSE stream
- **Predicts** stockout times with confidence intervals
- **Decides** optimal fuel allocations using AI agent reasoning
- **Explains** every decision in plain English (no black box)
- **Acts** by submitting allocations to the BUP simulator
- **Monitors** system health and allocation outcomes
- **Recovers** gracefully when components fail (circuit breaker + Redis fallback)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUP Fuel Supply Simulator                    │
│              http://localhost:8000  (Docker container)          │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST + SSE
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MCP SERVER LAYER                            │
│         (wraps simulator API as Claude tools)                   │
│                                                                 │
│  get_inventory()        get_stations()                          │
│  get_demand_history()   get_events()                            │
│  get_routes()           submit_allocation()                     │
│  get_metrics()          get_supply_arrivals()                   │ 
└────────────────────────┬────────────────────────────────────────┘
                         │ MCP Protocol
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              CLAUDE CODE ORCHESTRATOR (Main Agent)              │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐   │
│  │ Monitoring Agent│  │Forecasting Agent │  │Allocation     │   │
│  │                 │  │                  │  │Agent          │   │
│  │ - SSE stream    │  │ - stockout time  │  │ - best route  │   │
│  │ - shortage alert│  │ - demand forecast│  │ - quantity    │   │
│  │ - anomaly detect│  │ - risk scoring   │  │ - explanation │   │
│  │ - crisis detect │  │ - confidence %   │  │ - reasoning   │   │
│  └─────────────────┘  └──────────────────┘  └───────────────┘   │
└───────────────────────────────┬─────────────────────────────--- ┘
                                │ decisions + explanations
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                              │
│                                                                 │
│  POST /api/allocations     GET /api/stations                    │
│  GET  /api/alerts          GET /api/forecast                    │
│  GET  /api/decisions       GET /api/metrics                     │
│  GET  /health              GET /api/events                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │  Resilience Layer  │     │
│  │  decisions   │  │  cache +     │  │  circuit breaker   │     │
│  │  history     │  │  fallback    │  │  retry + backoff   │     │
│  │  alerts      │  │  state       │  │  degraded mode     │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
└───────────────────────────────┬─────────────────────────────--- ┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  REACT DASHBOARD│  │  OBSERVABILITY   │  │  DEVOPS LAYER    │
│                 │  │                  │  │                  │
│ - inventory map │  │  Prometheus      │  │  Docker Compose  │
│ - shortage alert│  │  Grafana         │  │  GitHub Actions  │
│ - AI decisions  │  │  Loki (logs)     │  │  k6 load tests   │
│ - explanation   │  │  Alert rules     │  │  Health checks   │
│ - system health │  │  /metrics        │  │  CI/CD pipeline  │
└─────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Quick Start

```bash
git clone https://github.com/Punih3r7/-Fuel-Supply-Simulator-.git
cd Fuel-Supply-Simulator
docker compose up -d
```

Wait ~15 seconds for all services to be healthy, then open:

| Service | URL |
|---|---|
| Simulator | http://localhost:8000/v1/health |
| Backend | http://localhost:8080/health |
| Dashboard | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin) |

The simulator advances **one tick every 30 seconds** automatically — inventory levels change visibly without any manual intervention.

---

## Dashboard

The operator dashboard (port 3000) has a full light-theme redesign with a 68 px dark-navy sidebar for navigation.

**Dashboard page:**
- 4 stat cards: active stations, open alerts, decisions taken, average fill %
- Station inventory cards: live fuel progress bars (DIESEL / PETROL / OCTANE) per station with colour-coded fill level
- Live Fuel Pulse: animated equalizer bars per fuel type + circular fill rings that update in real time
- Demand history line chart (last 60 readings, smooth bezier curve)
- Station bar chart and donut chart (SVG, no external chart library)
- System status widget (backend / simulator / circuit-breaker pill indicators)

**Other pages:** Alerts (skeleton loading state, polls every 8 s), Decisions (NL explanation badge), Events (normalised simulator events with severity icon + affected station/route).

---

## Observability

**Prometheus** scrapes only the backend (`/metrics` on port 8080). The simulator has no `/metrics` endpoint and is intentionally excluded.

Custom metrics exposed:
| Metric | Type | Description |
|---|---|---|
| `fuel_alerts_detected_total` | Counter | Alerts raised, labelled by risk level |
| `fuel_decisions_submitted_total` | Counter | Allocations dispatched |
| `fuel_fallback_activations_total` | Counter | Redis cache served in place of simulator |
| `fuel_circuit_breaker_open` | Gauge | 1 when circuit is open, 0 when closed |

**Grafana** auto-provisions its Prometheus datasource and dashboard on first boot — no manual setup needed.

---

## Resilience

The circuit breaker (`backend/resilience/circuit_breaker.py`) tracks consecutive simulator failures:

```
CLOSED ──3 failures──▶ OPEN ──30 s──▶ HALF_OPEN ──success──▶ CLOSED
                                          │
                                          └──failure──▶ OPEN
```

All simulator calls go through `with_fallback(key, fetch_fn)` which primes Redis on success and serves cached data when the circuit is open.

Run the chaos test to verify end-to-end:

```bash
bash devops/chaos-test.sh
```

Steps: prime cache → stop simulator → open circuit (3 requests) → verify 200 from cache → restart simulator → wait 35 s → verify circuit closes.

---

## Load Testing

```bash
k6 run devops/k6/smoke-test.js   # 1 VU / 30 s
k6 run devops/k6/load-test.js    # ramps to 50 VUs
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Backend liveness check |
| GET | `/system-status` | Backend + simulator + circuit breaker state |
| GET | `/stations` | Station inventory (Redis-cached, CB-protected) |
| GET | `/depots` | Depot stock levels |
| GET | `/alerts` | Open alerts (`?resolved=1` for resolved) |
| POST | `/alerts/resolve` | Resolve alerts for a station+fuel |
| POST | `/alerts/clear-all` | Mark all open alerts resolved |
| GET | `/decisions` | Recent allocation decisions |
| GET | `/events` | Active simulator disruption events |
| GET | `/metrics` | Prometheus metrics |
| GET | `/demand-history` | Historical demand readings (`?limit=60`) |

---

## Agents

The orchestrator runs a continuous loop:

1. Read station state from simulator
2. Resolve any alerts where inventory has recovered above threshold
3. Detect shortages (monitoring agent)
4. Forecast stockout risk (forecasting agent)
5. Decide optimal allocations (allocation agent)
6. Save alerts + decisions to the backend DB

Agents are started automatically in the `agents` Docker service and connect to both the simulator and the backend.

---

## Project Structure

```
Fuel-Supply-Simulator/
├── mcp-server/          # MCP Server — wraps BUP simulator as Claude tools
├── agents/              # Claude Code orchestrator + subagents
├── backend/             # FastAPI REST API
├── frontend/            # React operator dashboard
├── observability/       # Prometheus, Grafana configs + auto-provisioning
├── devops/              # k6 load tests, chaos-test.sh
├── docs/                # Architecture, ADRs, day plans
└── .github/workflows/   # CI/CD pipelines
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Orchestration | Claude Code (Subagents + MCP) |
| MCP Server | Python + FastMCP |
| Backend API | Python FastAPI |
| Database | PostgreSQL 16 |
| Cache / Fallback | Redis 7 |
| Frontend | React 18 + Vite (SVG charts, no external chart lib) |
| Observability | Prometheus + Grafana (auto-provisioned) |
| Load Testing | k6 |
| DevOps | Docker Compose + GitHub Actions |

---