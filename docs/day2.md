# Day 2 - Nov 23

## Theme: Claude Agents - Monitor, Forecast, Allocate

---

## Push 1 - Agent folder structure and orchestrator

Created the agents/ directory with three subfolders: monitor, forecaster, allocator.

Built the main orchestrator in agents/orchestrator.py. It runs the core loop — Observe, Detect, Predict, Decide, Act, Monitor, Recover — and coordinates the three subagents in sequence each cycle. If a cycle fails it waits 10 seconds and retries so the loop never dies.

Files added:
```
agents/orchestrator.py
agents/monitor/__init__.py
agents/forecaster/__init__.py
agents/allocator/__init__.py
```

---

## Push 2 - Monitoring agent

Built the monitoring agent in agents/monitor/agent.py. It calls the simulator directly, reads inventory across all 4 stations for all 3 fuel types, and raises a ShortageAlert whenever a station's fill ratio drops below 25% capacity. It also pulls active crisis events so the alert carries context about what else is happening in the network at that moment.

Files added:
```
agents/monitor/agent.py
```

[Back to README](../README.md)
