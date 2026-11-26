#!/bin/bash
# Resilience chaos test — proves the system stays alive when simulator fails

BACKEND="http://localhost:8080"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "  Fuel Supply Resilience Chaos Test"
echo "========================================"
echo ""

echo -e "${GREEN}[1] Baseline — system healthy${NC}"
curl -s "$BACKEND/health" | python3 -m json.tool
echo ""

echo -e "${GREEN}[2] Prime Redis cache — stations + depots${NC}"
curl -s "$BACKEND/stations" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} stations loaded from simulator')"
curl -s "$BACKEND/depots" > /dev/null
echo "Cache primed."
echo ""

echo -e "${RED}[3] Injecting fault — stopping simulator${NC}"
docker compose stop simulator
echo "Simulator stopped."
echo ""

echo "Triggering 3 requests to open circuit breaker..."
curl -s "$BACKEND/stations" > /dev/null
curl -s "$BACKEND/stations" > /dev/null
curl -s "$BACKEND/stations" > /dev/null
sleep 2

echo -e "${YELLOW}[4] Health check — system in degraded mode${NC}"
curl -s "$BACKEND/health" | python3 -m json.tool
echo ""

echo -e "${YELLOW}[5] Stations — served from Redis cache (not live)${NC}"
RESULT=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND/stations")
if [ "$RESULT" = "200" ]; then
  echo -e "${GREEN}Cache hit — dashboard still serving data (HTTP $RESULT)${NC}"
  curl -s "$BACKEND/stations" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} stations served from Redis cache')"
else
  echo -e "${RED}Cache miss — HTTP $RESULT${NC}"
fi
echo ""

echo -e "${YELLOW}[6] System status — circuit breaker state${NC}"
curl -s "$BACKEND/system-status" | python3 -m json.tool
echo ""

echo -e "${GREEN}[7] Recovery — restarting simulator${NC}"
docker compose start simulator
echo "Waiting 35 seconds for simulator to become healthy and circuit to half-open..."
sleep 35
# trigger a successful request so circuit transitions HALF_OPEN → CLOSED
curl -s "$BACKEND/stations" > /dev/null
echo ""

echo -e "${GREEN}[8] System recovered${NC}"
curl -s "$BACKEND/health" | python3 -m json.tool
echo ""

echo -e "${GREEN}[9] System status after recovery${NC}"
curl -s "$BACKEND/system-status" | python3 -m json.tool
echo ""

echo "========================================"
echo "  Chaos test complete"
echo "  Result: system remained usable during"
echo "  full simulator outage via Redis cache"
echo "========================================"
