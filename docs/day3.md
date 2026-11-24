# Day 3 - Nov 24

## Theme: FastAPI Backend + PostgreSQL + Redis

---

Started the backend today. This is the layer that sits between the agents and the dashboard — the agents write their decisions here, the dashboard reads from here. Created the full folder structure: api, db, cache, resilience, simulator. Built the FastAPI app entry point in main.py and wired up all the routers so the structure is clear before filling each one in.

Files added:
```
backend/main.py
backend/api/__init__.py
backend/db/__init__.py
backend/cache/__init__.py
backend/resilience/__init__.py
backend/simulator/__init__.py
```

Then built the simulator client in backend/simulator/client.py. It wraps every call to the BUP simulator with retry logic — if a request fails it waits and tries again up to 3 times with increasing delay. If the simulator returns 503 it raises SimulatorUnavailable so the resilience layer above it knows to switch to cached data instead of crashing.

Files added:
```
backend/simulator/client.py
```

After that built all the API routes. Stations and depots call the simulator client directly and pass the response through. Events and metrics do the same. Alerts and decisions read from PostgreSQL — those are written by the agents, not fetched live. Health checks both the backend itself and whether the simulator is reachable.

Files added:
```
backend/api/stations.py
backend/api/depots.py
backend/api/events.py
backend/api/metrics.py
backend/api/alerts.py
backend/api/decisions.py
backend/api/health.py
```

[Back to README](../README.md)
