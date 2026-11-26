import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function Header({ page, setPage }) {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const poll = () => api.systemStatus()
      .then(setStatus)
      .catch(() => api.health().then(h => setStatus({ ...h, active_alerts: '?', total_decisions: '?' }))
      .catch(() => setStatus({ backend: 'error', simulator: 'error' })))
    poll()
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [])

  const dot = s => ({
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 5,
    background: s === 'ok' ? '#4ade80' : s === 'unavailable' ? '#fbbf24' : '#f87171',
  })

  const cbColor = s => s === 'closed' ? '#4ade80' : s === 'open' ? '#f87171' : '#fbbf24'

  const navItem = (label, key) => (
    <button onClick={() => setPage(key)} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem',
      borderRadius: 6, color: page === key ? '#38bdf8' : '#64748b',
      fontWeight: page === key ? 600 : 400, fontSize: '0.9rem',
    }}>{label}</button>
  )

  return (
    <header style={{
      background: '#0f172a', borderBottom: '1px solid #1e293b',
      padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>Fuel Intelligence</span>
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {navItem('Dashboard', 'dashboard')}
          {navItem('Alerts', 'alerts')}
          {navItem('Decisions', 'decisions')}
          {navItem('Events', 'events')}
        </nav>
      </div>
      {status && (
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: '#64748b', alignItems: 'center' }}>
          <span><span style={dot(status.backend)} />backend</span>
          <span><span style={dot(status.simulator)} />simulator</span>
          {status.circuit_breaker && (
            <span style={{ color: cbColor(status.circuit_breaker) }}>
              CB: {status.circuit_breaker}
            </span>
          )}
          {status.active_alerts !== undefined && (
            <span style={{ color: status.critical_alerts > 0 ? '#f87171' : '#64748b' }}>
              {status.active_alerts} alerts
            </span>
          )}
          {status.total_decisions !== undefined && (
            <span>{status.total_decisions} decisions</span>
          )}
        </div>
      )}
    </header>
  )
}
