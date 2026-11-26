import { useState, useEffect } from 'react'
import { api } from '../api/client'

const TITLES = { dashboard: 'DASHBOARD', alerts: 'ALERTS', decisions: 'DECISIONS', events: 'EVENTS' }

export default function Header({ page }) {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const poll = () => api.systemStatus().then(setStatus).catch(() => {})
    poll()
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [])

  const pill = (label, ok) => (
    <span style={{
      padding: '3px 11px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: ok ? '#f0fdf4' : '#fef2f2',
      color: ok ? '#16a34a' : '#dc2626',
    }}>● {label}</span>
  )

  const cbOk = status?.circuit_breaker === 'closed'

  return (
    <header style={{
      height: 62, background: 'white', borderBottom: '1px solid #e8ecf0',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0,
    }}>
      <h1 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', letterSpacing: '0.08em', minWidth: 110 }}>
        {TITLES[page] || 'DASHBOARD'}
      </h1>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fc',
        border: '1px solid #e8ecf0', borderRadius: 8, padding: '6px 12px', maxWidth: 280, flex: '0 1 280px',
      }}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input readOnly placeholder="Search..." style={{
          border: 'none', outline: 'none', background: 'none', fontSize: 13, color: '#64748b', width: '100%', cursor: 'default',
        }}/>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Status pills */}
      {status && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {pill(`Backend ${status.backend}`, status.backend === 'ok')}
          {pill(`Sim ${status.simulator}`, status.simulator === 'ok')}
          {status.circuit_breaker && pill(`CB: ${status.circuit_breaker}`, cbOk)}
        </div>
      )}

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid #e8ecf0', paddingLeft: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Admin</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Fuel Intelligence</div>
        </div>
        <div style={{
          width: 34, height: 34, background: 'linear-gradient(135deg,#f97316,#fb923c)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>A</div>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </header>
  )
}
