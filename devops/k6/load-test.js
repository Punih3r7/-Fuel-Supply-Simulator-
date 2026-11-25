import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m',  target: 20 },
    { duration: '30s', target: 50 },
    { duration: '1m',  target: 50 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed:   ['rate<0.01'],
  },
}

const BASE = 'http://localhost:8080'

export default function () {
  const endpoints = [
    `${BASE}/health`,
    `${BASE}/stations`,
    `${BASE}/depots`,
    `${BASE}/alerts`,
    `${BASE}/decisions?limit=20`,
    `${BASE}/metrics`,
  ]

  const url = endpoints[Math.floor(Math.random() * endpoints.length)]
  const res = http.get(url)

  check(res, {
    'status 200': r => r.status === 200,
    'response under 500ms': r => r.timings.duration < 500,
  })

  sleep(0.5)
}
