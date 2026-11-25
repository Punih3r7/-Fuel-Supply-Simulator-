import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function Header({ page, setPage }) {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    const poll = () => api.health().then(setHealth).catch(() => setHealth({ backend: 'error', simulator: 'error' }))
    poll()
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [])

  const dot = s => ({
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 5,
    background: s === 'ok' ? '#4ade80' : s === 'unavailable' ? '#fbbf24' : '#f87171',
  })

  const navItem = (label, key) => (
    <button onClick={() => setPage(key)} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem',
      borderRadius: 6, color: page === key ? '#38bdf8' : '#64748b',
      fontWeight: page === key ? 600 : 400, fontSize: '0.9rem',
    }}>{label}</button>
  )

  return (
    <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>Fuel Intelligence</span>
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {navItem('Dashboard', 'dashboard')}
          {navItem('Alerts', 'alerts')}
          {navItem('Decisions', 'decisions')}
        </nav>
      </div>
      {health && (
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          <span><span style={dot(health.backend)} />backend</span>
          <span><span style={dot(health.simulator)} />simulator</span>
        </div>
      )}
    </header>
  )
}
