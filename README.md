# Fuel Supply Intelligence & Resilience Platform

> **BUP CSE FEST 2026 — Final Hackathon** | In association with Poridhi.io
> Build. Deploy. Observe. Respond.

An intelligent, agentic fuel supply operations platform built on top of the BUP Fuel Supply Simulator. Uses **Claude Code's agentic capabilities** (MCP Server + Subagents) to monitor, forecast, decide, and explain fuel allocation decisions across Bangladesh's simulated supply network.

---

## Build Progress

| Day | Date | Status | What Was Built |
|-----|------|--------|----------------|
| Day 1 | Nov 20 – 22 | ✅ Done | Architecture design, project skeleton, MCP server foundation |
| Day 2 | Nov 23 | 🔄 In Progress | Claude agents — monitor, forecast, allocate subagents |
| Day 3 | Nov 24 | ⏳ Planned | FastAPI backend + PostgreSQL + Redis resilience layer |
| Day 4 | Nov 25 | ⏳ Planned | React operator dashboard + Prometheus/Grafana observability |
| Day 5 | Nov 26 | ⏳ Planned | Load testing + CI/CD + final demo polish |

---

<details>
<summary><strong>Day 1 — Nov 20 to 22 ✅ Architecture + Project Skeleton + MCP Server Foundation</strong></summary>

### What Was Done

**Architecture Design**
- Defined the full 6-layer system architecture: Simulator → MCP Server → Claude Agents → FastAPI Backend → React Dashboard → DevOps/Observability
- Made the key design decision to use Claude Code's agentic stack (MCP + Subagents) instead of a traditional ML pipeline — this means Claude itself reasons about fuel shortages and explains every decision in plain English
- Documented all architecture decisions in [`docs/architecture.md`](docs/architecture.md)
- Created 5-day delivery plan in [`docs/build-plan.md`](docs/build-plan.md)

**Project Skeleton**
- Created full folder structure for all 6 layers (agents, backend, frontend, observability, devops come in later days)
- Set up `.gitignore`, `.env.example`, `docker-compose.yml` with simulator + MCP server
- Stubbed out future services (backend, frontend, Prometheus, Grafana) as commented blocks in docker-compose — they get enabled day by day

**MCP Server Foundation**
- Built the complete MCP server in [`mcp-server/server.py`](mcp-server/server.py)
- Wrapped all 13 BUP Fuel Supply Simulator endpoints as Claude-callable tools:
  - `get_health()` — liveness probe
  - `get_instance()` — current tick, sim_time, status
  - `get_depots()` / `get_depot(id)` — depot inventory and capacity
  - `get_stations()` / `get_station(id)` — station inventory and demand
  - `get_routes()` — route availability and transit times
  - `get_demand_history(station_id, limit)` — time-series data for forecasting
  - `get_supply_arrivals()` — upcoming fuel deliveries
  - `get_events()` — active crisis events
  - `get_allocations()` — submitted allocation history
  - `get_metrics()` — service level and allocation failure stats
  - `submit_allocation(...)` — the only write operation
  - `cancel_allocation(id)` — cancel PENDING allocations
- Added smoke tests in [`mcp-server/tests/test_tools.py`](mcp-server/tests/test_tools.py)
- Dockerized the MCP server

### Files Added
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

### Key Decision
Chose Claude Code's agentic approach (MCP + Subagents) over traditional ML pipelines because:
1. Claude can explain *why* it recommends an allocation — no other team is doing this
2. Directly matches the Poridhi lab curriculum on Agentic Engineering with Claude Code
3. MCP is the standard protocol for connecting Claude to external systems like the simulator

</details>

<details>
<summary><strong>Day 2 — Nov 23 🔄 Claude Agents — Monitor, Forecast, Allocate</strong></summary>

*Work in progress — check back after Nov 23 commit.*

</details>

<details>
<summary><strong>Day 3 — Nov 24 ⏳ FastAPI Backend + PostgreSQL + Redis</strong></summary>

*Planned — starts Nov 24.*

</details>

<details>
<summary><strong>Day 4 — Nov 25 ⏳ React Dashboard + Observability</strong></summary>

*Planned — starts Nov 25.*

</details>

<details>
<summary><strong>Day 5 — Nov 26 ⏳ Load Testing + CI/CD + Final Demo</strong></summary>

*Planned — starts Nov 26 (deadline day).*

</details>

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
curl http://localhost:8000/v1/health   # simulator
curl http://localhost:8080/health      # backend (Day 3+)
```

---

## Project Structure

```
Fuel-Supply-Simulator/
├── mcp-server/          # MCP Server — wraps BUP simulator as Claude tools
├── agents/              # Claude Code orchestrator + subagents (Day 2)
├── backend/             # FastAPI REST API (Day 3)
├── frontend/            # React operator dashboard (Day 4)
├── observability/       # Prometheus, Grafana, Loki configs (Day 4)
├── devops/              # k6 load tests, scripts (Day 5)
├── docs/                # Architecture, ADRs, day plans
└── .github/workflows/   # CI/CD pipelines (Day 5)
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
| Frontend | React 18 + Vite + Tailwind CSS |
| Observability | Prometheus + Grafana + Loki |
| Load Testing | k6 |
| DevOps | Docker Compose + GitHub Actions |

---

**Deadline: November 26, 2026**
