# Day 1 - Nov 20 to 22

## Theme: Architecture + Project Skeleton + MCP Server Foundation

---

Poridhi told us to go through the agentic engineering labs with Claude Code before building. So instead of going the usual ML pipeline route that most teams take, the whole system is built around Claude Code's agentic stack — MCP server plus subagents. The idea is that Claude itself reads the simulator state, reasons about what is going wrong, and explains every allocation decision in plain English. No black box.

Spent the first part of these days reading the hackathon brief and the simulator integration guide carefully. The simulator gives us 2 depots, 4 stations, 6 routes, and 3 fuel types. It runs on a 15-minute tick clock and talks to us over REST and SSE. Our job is not to touch the simulator — just to build the intelligent system on top of it.

Defined the full 6-layer architecture:

```
Simulator -> MCP Server -> Claude Agents -> FastAPI Backend -> React Dashboard -> DevOps
```

The MCP server is what connects Claude to the simulator. Without it Claude has no way to read inventory or submit allocations. So that was the first real thing to build.

Built the project skeleton with the full folder structure, a docker-compose that starts the simulator and MCP server together, and stubbed the rest of the services as commented blocks. Each day one more service gets uncommented and wired in.

Built the complete MCP server wrapping all 13 BUP simulator endpoints as Claude-callable tools — health check, instance state, depots, stations, routes, demand history, supply arrivals, events, allocations, metrics, submit allocation, and cancel allocation. Added smoke tests and a Dockerfile.

---

## Summary

- Decided on agentic architecture using Claude Code MCP and Subagents instead of traditional ML
- Full project folder structure created for all 6 layers
- docker-compose.yml with simulator and MCP server running together
- MCP server with all 13 simulator tools wrapped and callable by Claude
- Smoke tests passing for all endpoints
- MCP server Dockerized and wired into docker-compose

[Back to README](../README.md)
