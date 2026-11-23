# Day 2 - Nov 23

## Theme: Claude Agents - Monitor, Forecast, Allocate

Work started. Pushing in stages throughout the day.

---

## Progress

### Done so far

- Created agents/ folder with three subagent directories: monitor, forecaster, allocator
- Built the main orchestrator in agents/orchestrator.py
- Orchestrator runs the cycle: Observe -> Detect -> Predict -> Decide -> Act -> Monitor -> Recover
- Coordinates the three subagents in sequence each cycle
- Handles errors with retry so it stays running if one cycle fails

### In progress

- Monitoring agent (agents/monitor/agent.py) - reads station inventory, detects shortage alerts
- Forecasting agent (agents/forecaster/agent.py) - calculates hours to stockout per station per fuel
- Allocation agent (agents/allocator/agent.py) - decides what to send where, writes explanation

### Still to push today

- All three agent implementations
- Agent requirements.txt and Dockerfile
- Unit tests for each agent

[Back to README](../README.md)
