# Building an Agentic Fuel Supply Intelligence Platform — From Sketch to Production

> BUP CSE FEST 2026 · Poridhi.io Hackathon
> Five days. Six layers. One agentic system that reasons about fuel shortages and explains every decision in plain English.

---

## Where It Started

The brief was straightforward on the surface: plug into the BUP Fuel Supply Simulator and build a system that keeps Bangladesh's simulated fuel network running. The simulator gives you two depots, four stations, six routes, and three fuel types — DIESEL, PETROL, OCTANE. It runs on a 15-minute tick clock. You cannot touch the simulator itself. You just read from it and act.

Most teams would reach for a script: poll inventory, threshold check, trigger allocation. Done in a day, boring to explain.

We went a different direction. Poridhi told us to go through the agentic engineering labs with Claude Code before we started building. So we did. And once you understand what an MCP server actually enables — Claude reading live state, reasoning about it, writing plain-English explanations — you do not want to build a threshold script. You want to build something that thinks.

The architecture decision was made on day one:

```
Simulator → MCP Server → Claude Agents → FastAPI Backend → React Dashboard → DevOps
```

Six layers. Each one doing a specific job. Claude sits in the middle of it, not as a wrapper but as the actual reasoning engine.

---

## Layer 1: The MCP Server

Before Claude can do anything it needs tools. The MCP server is what turns the simulator's REST endpoints into tools Claude can call.

We wrapped all 13 BUP simulator endpoints: health check, instance state, depots, stations, routes, demand history, supply arrivals, events, allocations, metrics, submit allocation, cancel allocation. Every one of these becomes a Claude-callable function.

The key insight here is that without the MCP server, Claude has no grounding. It cannot tell you that Station S3 has 12% DIESEL remaining and is projected to run dry in 4 hours unless you give it that data live. The MCP server is the bridge between the simulator's state and Claude's reasoning.

This was the first real thing we built, and it had to be solid before anything else made sense.

---

## Layer 2: The Agents

Three subagents, one orchestrator.

**Monitoring agent** — reads inventory across all four stations for all three fuel types every cycle. Whenever a station's fill ratio drops below 25% of capacity, it raises a shortage alert. It also pulls whatever active crisis events are running at that moment so the downstream agents have context.

**Forecasting agent** — takes those alerts and calculates how long each station has before stockout. It pulls the last 12 simulated hours of demand history for that station and fuel type, averages the consumption rate per tick, and divides current inventory by that rate. Results are sorted by urgency. CRITICAL under 3 hours, HIGH under 8, MEDIUM under 24.

**Allocation agent** — takes the CRITICAL and HIGH forecasts. For each one it finds the fastest available route to that station, checks the depot actually has stock, and works out a safe quantity to send — capped at half the depot stock, the route's maximum shipment, and the depot's dispatch limit. Then it writes a plain-English explanation: current inventory, demand rate, hours remaining, where it is sending from, transit time. That explanation goes to the dashboard and is what makes the system legible to a human operator.

**Orchestrator** — runs the loop. Observe → Detect → Predict → Decide → Act → Monitor → Recover. If anything fails mid-cycle it waits 10 seconds and retries instead of crashing.

---

## Layer 3: The Backend

The backend is the memory of the system. The agents write their decisions here. The dashboard reads from here. The resilience layer lives here.

**FastAPI** on port 8080. **PostgreSQL** storing alert history and decision history. **Redis** as the fallback cache.

The resilience design is the most important part of this layer.

The simulator is an external dependency. External dependencies fail. When they do, a naive system returns 503 and the operator sees a broken dashboard at exactly the moment they most need it.

We built a circuit breaker: three consecutive failures and the circuit opens. The system stops trying to reach the simulator entirely. After 30 seconds it moves to half-open and tries once. If that works, the circuit closes. If not, it goes back to open.

```
CLOSED ──3 failures──▶ OPEN ──30s──▶ HALF_OPEN ──success──▶ CLOSED
```

Every simulator call goes through `with_fallback()`. When the circuit is closed: call simulator, write result to Redis, return. When the circuit is open: return from Redis instead. The dashboard keeps serving data from cache and the operator never sees an error.

Custom Prometheus metrics track everything that matters:

- `fuel_alerts_detected_total` — alerts raised, by risk level
- `fuel_decisions_submitted_total` — allocations dispatched
- `fuel_fallback_activations_total` — times Redis served instead of the simulator
- `fuel_circuit_breaker_open` — 1 when open, 0 when closed

---

## What We Found When We Ran It

The first full end-to-end run surfaced three problems we had not seen during individual layer testing.

**The agents were not connecting.** The orchestrator was reading the environment variable `MCP_URL` but Docker Compose sets `SIMULATOR_URL`. Every agent cycle was connecting to nothing. Fixed with a one-line env var correction.

**The allocation agent was silently crashing.** It was calling `_get_depots()` and `_get_routes()` in its decision logic but those two methods were never defined. Python raised an `AttributeError` on every cycle. Zero decisions were ever made. Zero errors were visible in the logs because the orchestrator's try/except was swallowing it. Added the two missing async methods and decisions started flowing.

**The cache was never getting warm.** The stations and depots API routes were calling the simulator client directly, bypassing `with_fallback()` entirely. Redis never got primed. During fault injection the fallback layer was always empty. Both routes now go through `with_fallback()`.

After fixing these three things, the full loop worked: agents detecting shortages → forecasting risk → generating decisions → saving to the database → visible on the dashboard.

**The simulator was draining to zero.** The BUP simulator runs at full speed by default — it advances thousands of ticks the moment it starts. With enough ticks everything drains to 0% and nothing interesting happens. We added a controlled ticker: at startup the backend pauses the simulator, then sends one `/admin/step` every 30 seconds over an asyncio background task. Inventory now changes at a visible pace without needing any manual calls.

**4,932 stale alerts in the database.** From the original runs before the simulator was under control. Added a `/alerts/clear-all` endpoint and an alert resolution mechanism: after each agent cycle the orchestrator checks every station and fuel type. If inventory is back above the 25% threshold, it marks all open alerts for that station and fuel as resolved. The alert count in the dashboard now reflects reality.

---

## Layer 4: The Dashboard

The original dashboard was functional but plain — dark theme, top navigation, simple fuel bars. After the full system was working we rebuilt it.

The redesign uses a light theme with a 68 px dark-navy sidebar. Navigation moved to the sidebar with icon buttons and an orange active state. The header was rebuilt with a search bar, live system status pills (backend / simulator / circuit-breaker), and a user avatar.

**Dashboard page** has four sections:

Stat cards at the top — active stations, open alerts, decisions made, average fill percentage.

Station inventory cards — one card per station with animated horizontal progress bars for each fuel type. The colour shifts green to amber to red as fill drops. The card shows the station's average fill percentage.

Live Fuel Pulse — an animated equalizer section. Eight bars per fuel type bouncing at different speeds. Circular fill rings alongside. Floating ticker labels with real inventory numbers. The whole section is built with CSS `@keyframes` and updates with live data. It makes it immediately obvious the system is alive and the data is changing.

Charts — a demand history line chart with a smooth bezier curve and hover tooltip, a grouped station bar chart, and a donut chart. All three are hand-written SVG. No external chart library.

**Events page** reads active simulator disruption events. The raw simulator format is `{type, start_tick, end_tick, status, parameters}` — no severity, no human label. We wrote a normalisation layer that maps each event type to a severity level, an icon, and a description built from the parameters object. Station outages, route disruptions, demand spikes, depot constraints, shipment delays, supply shortfalls — each one renders with the right visual weight.

**Alerts page** shows open alerts with a skeleton loading state so the page does not flash blank on first load.

**Decisions page** shows every allocation the agent made with the plain-English explanation alongside a dispatched badge.

---

## Layer 5: Observability

Prometheus scrapes the backend on port 8080. The original config also had a scrape job for the simulator, but the simulator has no `/metrics` endpoint — that target was permanently DOWN. Removed it.

Grafana used to require manually importing the dashboard JSON through the UI on first boot. We created the full provisioning directory structure:

```
observability/grafana/
├── datasources/
│   └── prometheus.yml    ← auto-provisions Prometheus as default datasource
└── dashboards/
    ├── dashboards.yml    ← tells Grafana where to find dashboard files
    └── dashboard.json    ← the actual dashboard
```

Both the datasource and the dashboard now load automatically. Open Grafana at port 3001 and everything is already there.

---

## Layer 6: DevOps and Resilience Testing

Two k6 scripts: a smoke test (1 VU for 30 seconds, every endpoint) and a load test (ramps to 50 VUs, p95 latency target under 500 ms, error rate under 1%).

The chaos test script proves the resilience layer end-to-end:

```bash
bash devops/chaos-test.sh
```

1. Confirm baseline health
2. Warm Redis cache by calling `/stations` and `/depots`
3. Stop the simulator container
4. Fire three requests to open the circuit breaker
5. Confirm `/stations` still returns HTTP 200 — served from Redis
6. Check `/system-status` shows `circuit_breaker: "open"`
7. Start the simulator back up
8. Wait 35 seconds (past the 30-second recovery timeout)
9. Trigger one success request to push the circuit from HALF_OPEN to CLOSED
10. Confirm `/system-status` shows `circuit_breaker: "closed"`

The critical check is step 5. When the simulator is completely dead, the dashboard keeps working. The circuit is open, Redis has the last known state, and the operator sees data instead of an error page.

---

## The Stack

| Layer | Technology |
|---|---|
| AI Orchestration | Claude Code — MCP Server + Subagents |
| Backend | Python FastAPI + SQLAlchemy |
| Database | PostgreSQL 16 |
| Cache / Fallback | Redis 7 |
| Frontend | React 18 + Vite (SVG charts, no external chart lib) |
| Observability | Prometheus + Grafana (auto-provisioned) |
| Load Testing | k6 |
| Infrastructure | Docker Compose + GitHub Actions |

---

## Running the Full Stack

```bash
git clone https://github.com/Punih3r7/-Fuel-Supply-Simulator-.git
cd Fuel-Supply-Simulator
docker compose up -d
```

Wait about 15 seconds for all services to start, then:

| Service | URL |
|---|---|
| Dashboard | http://localhost:3000 |
| Backend API | http://localhost:8080/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / admin) |
| Simulator | http://localhost:8000/v1/health |

The simulator advances one tick every 30 seconds. Inventory levels change. Agents detect shortages, make decisions, and you can watch it all on the dashboard in real time.

---

## What This System Actually Is

It is not a monitoring tool that shows you numbers. It is a system that reads a situation, reasons about it, decides what to do, acts on that decision, and explains itself to a human.

When DIESEL at Station S3 drops below 25%, the monitoring agent raises an alert. The forecasting agent calculates that at current demand rates the station has 4.2 hours before stockout. The allocation agent picks the fastest available route from Depot D1, checks stock, calculates a safe quantity, submits the allocation to the simulator, and writes: "Station S3 has 1,200L DIESEL remaining, consuming ~285L/hour, stockout in 4.2 hours. Dispatching 3,000L from D1 via Route R2 (2.5h transit) to arrive with 1.7h margin."

That explanation is what shows up on the Decisions page. That is the differentiator. Not the allocation itself — a threshold script can allocate. The reasoning, made legible, so the human operator knows exactly what the system did and why.

[Back to README](../README.md)
