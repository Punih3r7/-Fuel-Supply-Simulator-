import { useState, useEffect } from 'react'
import { api } from '../api/client'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  return diff < 1 ? 'just now' : `${diff}m ago`
}

const RISK_STYLE = {
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', border: '#fdba74' },
  MEDIUM:   { bg: '#fefce8', color: '#ca8a04', border: '#fde047' },
  LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
}

function RiskBadge({ level }) {
  const s = RISK_STYLE[level] || RISK_STYLE.LOW
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    }}>{level}</span>
  )
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => api.alerts(0).then(a => { setAlerts(a); setLoading(false) }).catch(() => setLoading(false))
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading alerts…</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Active Alerts</h2>
        <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {alerts.length}
        </span>
      </div>

      {!alerts.length && (
        <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', border: '1px solid #eef1f6' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No active alerts</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map(a => {
          const s = RISK_STYLE[a.risk_level] || RISK_STYLE.LOW
          return (
            <div key={a.id} style={{
              background: 'white', borderRadius: 12, padding: '16px 20px',
              border: '1px solid #eef1f6', borderLeft: `4px solid ${s.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{a.station_name || a.station_id}</span>
                  <span style={{
                    background: '#f8f9fc', color: '#64748b',
                    padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  }}>{a.fuel_type}</span>
                  <RiskBadge level={a.risk_level} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>{timeAgo(a.created_at)}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{Math.round(a.current_inventory).toLocaleString()}L</span>
                {' '}remaining · stockout in{' '}
                <span style={{ fontWeight: 600, color: s.color }}>{a.hours_to_stockout.toFixed(1)}h</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
