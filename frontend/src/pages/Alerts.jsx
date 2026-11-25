import { useState, useEffect } from 'react'
import { api } from '../api/client'
import AlertBadge from '../components/AlertBadge'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  return diff < 1 ? 'just now' : `${diff}m ago`
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

  if (loading) return <p style={{ color: '#475569' }}>Loading alerts...</p>

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        Active Alerts <span style={{ color: '#475569', fontWeight: 400, fontSize: '0.9rem' }}>({alerts.length})</span>
      </h2>
      {!alerts.length && <p style={{ color: '#475569' }}>No active alerts.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {alerts.map(a => (
          <div key={a.id} style={{ background: '#1e293b', borderRadius: 8, padding: '1rem 1.25rem', borderLeft: '3px solid #f87171' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ color: '#e2e8f0', fontWeight: 600, marginRight: '0.75rem' }}>{a.station_id}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginRight: '0.75rem' }}>{a.fuel_type}</span>
                <AlertBadge level={a.risk_level} />
              </div>
              <span style={{ color: '#475569', fontSize: '0.75rem' }}>{timeAgo(a.created_at)}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
              {Math.round(a.current_inventory)}L remaining · {a.hours_to_stockout.toFixed(1)}h to stockout
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
