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
| Day 4 | Nov 25 | In Progress | React operator dashboard + Prometheus/Grafana observability | [View details](docs/day4.md) |
| Day 5 | Nov 26 | Planned | Load testing + CI/CD + final demo polish | [View details](docs/day5.md) |

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
├── agents/              # Claude Code orchestrator + subagents 
├── backend/             # FastAPI REST API 
├── frontend/            # React operator dashboard 
├── observability/       # Prometheus, Grafana, Loki configs
├── devops/              # k6 load tests, scripts 
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
| Database | <!-- PostgreSQL 16 --> |
| Cache / Fallback | Redis 7 |
| Frontend | <!-- React 18 + Vite + Tailwind CSS --> |
| Observability | <!-- Prometheus + Grafana + Loki --> |
| Load Testing | <!-- k6 --> |
| DevOps | Docker Compose + GitHub Actions |

---