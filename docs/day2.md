# Day 2 - Nov 23

## Theme: Claude Agents - Monitor, Forecast, Allocate

---

Started setting up the agents layer today. Created the agents/ directory with three subfolders for each agent and built the main orchestrator first since everything else hangs off it. The orchestrator runs the core loop — Observe, Detect, Predict, Decide, Act, Monitor, Recover — and calls each agent in sequence. If anything fails mid-cycle it waits and retries instead of crashing.

After that built the monitoring agent. It reads inventory across all 4 stations for all 3 fuel types and raises a shortage alert whenever a station's fill ratio drops below 25% of capacity. It also pulls whatever active crisis events are running at that moment so the alert carries that context forward to the next agent.

Files added so far:
```
agents/orchestrator.py
agents/monitor/__init__.py
agents/monitor/agent.py
agents/forecaster/__init__.py
agents/allocator/__init__.py
```

Then built the forecasting agent. It takes the alerts from the monitoring agent, pulls the last 12 simulated hours of demand history for that station and fuel type, averages it out per tick, and divides the current inventory by that rate to get hours remaining before stockout. Results come back sorted by urgency — most critical first. Risk levels are CRITICAL under 3 hours, HIGH under 8, MEDIUM under 24, LOW after that.

Files added:
```
agents/forecaster/agent.py
```

[Back to README](../README.md)
