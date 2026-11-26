import { useState, useEffect } from 'react'
import { api } from '../api/client'

const SEV = {
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', dot: '#dc2626' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', border: '#fdba74', dot: '#f97316' },
  MEDIUM:   { bg: '#fefce8', color: '#ca8a04', border: '#fde047', dot: '#facc15' },
  LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', dot: '#4ade80' },
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const poll = () => api.events()
      .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
    poll()
    const id = setInterval(poll, 15000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading events…</p>

  const active   = events.filter(e => e.status === 'ACTIVE')
  const inactive = events.filter(e => e.status !== 'ACTIVE')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Disruption Events</h2>
        {active.length > 0 && (
          <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {active.length} Active
          </span>
        )}
      </div>

      {!events.length && (
        <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', border: '1px solid #eef1f6' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No active disruptions — network operating normally</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...active, ...inactive].map((e, i) => {
          const s = SEV[e.severity] || SEV.MEDIUM
          return (
            <div key={i} style={{
              background: 'white', borderRadius: 12, padding: '16px 20px',
              border: '1px solid #eef1f6', borderLeft: `4px solid ${s.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              opacity: e.status === 'ACTIVE' ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot }}/>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{e.type || e.event_type || 'Disruption'}</span>
                  <span style={{
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  }}>{e.severity}</span>
                  <span style={{
                    background: e.status === 'ACTIVE' ? '#fef2f2' : '#f1f5f9',
                    color: e.status === 'ACTIVE' ? '#dc2626' : '#64748b',
                    padding: '2px 8px', borderRadius: 6, fontSize: 11,
                  }}>{e.status}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
                  {e.start_tick ? `Tick ${e.start_tick}` : ''}
                </span>
              </div>
              {e.description && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: '0 0 8px' }}>{e.description}</p>
              )}
              {e.affected_stations?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(Array.isArray(e.affected_stations) ? e.affected_stations : [e.affected_stations]).map(sid => (
                    <span key={sid} style={{
                      background: '#f8f9fc', color: '#64748b', border: '1px solid #e2e8f0',
                      padding: '2px 8px', borderRadius: 6, fontSize: 11,
                    }}>{sid}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
