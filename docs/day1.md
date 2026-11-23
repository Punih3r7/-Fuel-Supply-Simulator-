# Day 1 - Nov 20 to 22

## Theme: Architecture + Project Skeleton + MCP Server Foundation

---

Poridhi told us to go through the agentic engineering labs with Claude Code before building. So instead of a traditional ML pipeline, the whole system is built around Claude Code's agentic stack — MCP server plus subagents. Claude reasons about fuel shortages and explains every decision in plain English.

Defined the full 6-layer architecture:

```
Simulator -> MCP Server -> Claude Agents -> FastAPI Backend -> React Dashboard -> DevOps
```

Built the project skeleton with all folder structure, docker-compose wired to the simulator, and stubbed future services as commented blocks that get enabled day by day.

Built the complete MCP server wrapping all 13 BUP simulator endpoints as Claude-callable tools — health, instance, depots, stations, routes, demand history, supply arrivals, events, allocations, metrics, submit allocation, cancel allocation. Added smoke tests and Dockerized it.

---

## Summary

- Decided on agentic architecture using Claude Code MCP + Subagents
- Full project folder structure created
- docker-compose.yml with simulator and MCP server running
- MCP server with all 13 simulator tools wrapped and tested
- Smoke tests passing for all endpoints
- Dockerfile for MCP server

[Back to README](../README.md)
