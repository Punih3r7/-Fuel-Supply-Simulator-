const BASE = '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export const api = {
  health: () => get('/health'),
  systemStatus: () => get('/system-status'),
  stations: () => get('/stations'),
  depots: () => get('/depots'),
  alerts: (resolved = 0) => get(`/alerts?resolved=${resolved}`),
  decisions: (limit = 20) => get(`/decisions?limit=${limit}`),
  events: () => get('/events'),
  metrics: () => get('/metrics'),
}
