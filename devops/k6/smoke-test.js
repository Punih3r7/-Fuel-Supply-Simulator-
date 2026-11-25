import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 1,
  duration: '30s',
}

const BASE = 'http://localhost:8080'

export default function () {
  const health = http.get(`${BASE}/health`)
  check(health, {
    'health status 200': r => r.status === 200,
    'backend ok': r => JSON.parse(r.body).backend === 'ok',
  })

  const stations = http.get(`${BASE}/stations`)
  check(stations, { 'stations status 200': r => r.status === 200 })

  const alerts = http.get(`${BASE}/alerts`)
  check(alerts, { 'alerts status 200': r => r.status === 200 })

  const decisions = http.get(`${BASE}/decisions`)
  check(decisions, { 'decisions status 200': r => r.status === 200 })

  sleep(1)
}
