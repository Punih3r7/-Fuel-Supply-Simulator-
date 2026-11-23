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

[Back to README](../README.md)
