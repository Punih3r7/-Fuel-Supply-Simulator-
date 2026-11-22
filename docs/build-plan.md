# Build Plan — Day by Day

Deadline: **November 26, 2026**
Today: **November 22, 2026**

---

## Day 1 — Nov 22 ✅ DONE
**Theme: Foundation**

- [x] Architecture design and documentation
- [x] Project folder structure created
- [x] MCP server scaffolding (tools, config, Dockerfile)
- [x] docker-compose.yml skeleton with simulator service
- [x] .gitignore and project config files
- [x] Initial GitHub push

**Output:** Repository is live with architecture decisions documented and MCP server foundation in place.

---

## Day 2 — Nov 23
**Theme: Intelligence Layer (Claude Agents)**

- [ ] MCP server fully connected to simulator (all 13 tools working)
- [ ] Main orchestrator agent loop implemented
- [ ] Monitoring subagent: SSE stream listener + anomaly detection
- [ ] Forecasting subagent: hours-to-stockout calculator + risk scoring
- [ ] Allocation subagent: decision engine + plain-English explanation generator
- [ ] Agent loop tested against live simulator
- [ ] Unit tests for each agent

**Output:** Claude agents can observe the simulator, detect shortages, and recommend allocations with explanations.

---

## Day 3 — Nov 24
**Theme: Backend + Data Layer**

- [ ] FastAPI backend with all API endpoints
- [ ] PostgreSQL schema: decisions, alerts, demand_snapshots
- [ ] Redis cache layer with circuit breaker
- [ ] Resilience layer: retry logic, fallback to rule-based allocation
- [ ] Backend health endpoint showing all component statuses
- [ ] Agents connected to backend (write decisions to DB)
- [ ] Integration tests: simulator → MCP → agent → backend

**Output:** Full data pipeline working. Backend serves decisions and alerts from database.

---

## Day 4 — Nov 25
**Theme: Dashboard + Observability**

- [ ] React dashboard: network overview (depots + stations)
- [ ] Shortage alerts panel with urgency sorting
- [ ] AI recommendations panel with reasoning display
- [ ] Decision history / audit trail view
- [ ] System health status panel
- [ ] Prometheus metrics exposed from backend
- [ ] Grafana dashboards: inventory, service level, allocation rate
- [ ] Loki structured logging from all services
- [ ] Grafana alerts: stockout risk, error rate, simulator unreachable

**Output:** Operators can see everything. Judges can observe the system through Grafana.

---

## Day 5 — Nov 26
**Theme: Testing + Polish + Demo**

- [ ] k6 load test on prediction API + allocation endpoint
- [ ] Load test results documented (p50/p95/p99 latency, throughput)
- [ ] GitHub Actions CI/CD pipeline (lint, test, build, push image)
- [ ] Resilience demo: inject 503 fault, verify Redis fallback activates
- [ ] Crisis demo: inject demand_spike, verify agent detects and responds
- [ ] docker compose up cold-start test (clean machine)
- [ ] Final demo rehearsal (14-step story)

**Output:** Production-ready submission. Full evidence of DevOps, resilience, observability, and load testing.
