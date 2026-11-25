import { useState, useEffect } from 'react'

const API = '/api'

export default function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch(`${API}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth({ backend: 'unreachable', simulator: 'unreachable' }))
  }, [])

  const statusColor = s => s === 'ok' ? '#4ade80' : s === 'unavailable' ? '#fbbf24' : '#f87171'

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: '#38bdf8', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
        Fuel Supply Intelligence Platform
      </h1>
      <p style={{ color: '#475569', marginBottom: '2rem', fontSize: '0.9rem' }}>BUP CSE FEST 2026</p>

      {health ? (
        <div style={{ background: '#1e293b', padding: '1rem 1.5rem', borderRadius: '8px', display: 'inline-flex', gap: '2rem' }}>
          <span style={{ color: '#94a3b8' }}>
            backend: <strong style={{ color: statusColor(health.backend) }}>{health.backend}</strong>
          </span>
          <span style={{ color: '#94a3b8' }}>
            simulator: <strong style={{ color: statusColor(health.simulator) }}>{health.simulator}</strong>
          </span>
        </div>
      ) : (
        <p style={{ color: '#475569' }}>connecting...</p>
      )}
    </div>
  )
}
