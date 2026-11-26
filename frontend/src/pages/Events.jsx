import { useState, useEffect } from 'react'
import { api } from '../api/client'

const severityColor = {
  CRITICAL: '#f87171',
  HIGH: '#fb923c',
  MEDIUM: '#fbbf24',
  LOW: '#4ade80',
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const poll = () => api.events().then(d => {
      setEvents(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
    poll()
    const id = setInterval(poll, 15000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <p style={{ color: '#475569' }}>Loading events...</p>

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        Live Disruptions & Events <span style={{ color: '#475569', fontWeight: 400, fontSize: '0.9rem' }}>({events.length} active)</span>
      </h2>
      {!events.length && (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#4ade80', margin: 0 }}>No active disruptions — network operating normally</p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {events.map((e, i) => {
          const color = severityColor[e.severity] || severityColor.MEDIUM
          return (
            <div key={i} style={{
              background: '#1e293b', borderRadius: 8, padding: '1rem 1.25rem',
              borderLeft: `3px solid ${color}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{
                    background: color, color: '#0f172a', fontSize: '0.7rem',
                    fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4
                  }}>{e.severity || e.type || 'EVENT'}</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{e.type || e.event_type || 'Disruption'}</span>
                </div>
                <span style={{ color: '#475569', fontSize: '0.75rem' }}>{e.status || 'ACTIVE'}</span>
              </div>
              {e.description && <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>{e.description}</p>}
              {e.affected_stations && (
                <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0.25rem 0 0' }}>
                  Affected: {Array.isArray(e.affected_stations) ? e.affected_stations.join(', ') : e.affected_stations}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
