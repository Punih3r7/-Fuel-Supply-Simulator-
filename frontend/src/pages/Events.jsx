import { useState, useEffect } from 'react'
import { api } from '../api/client'

const SEV = {
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', dot: '#dc2626' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', border: '#fdba74', dot: '#f97316' },
  MEDIUM:   { bg: '#fefce8', color: '#ca8a04', border: '#fde047', dot: '#facc15' },
  LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', dot: '#4ade80' },
}

/* Map simulator event type → severity + human label */
const TYPE_META = {
  station_outage:   { severity: 'CRITICAL', label: 'Station Outage',    icon: '🏭' },
  route_disruption: { severity: 'HIGH',     label: 'Route Disruption',  icon: '🚧' },
  demand_spike:     { severity: 'HIGH',     label: 'Demand Spike',      icon: '📈' },
  depot_constraint: { severity: 'MEDIUM',   label: 'Depot Constraint',  icon: '🏗️'  },
  shipment_delay:   { severity: 'MEDIUM',   label: 'Shipment Delay',    icon: '⏳' },
  supply_shortfall: { severity: 'CRITICAL', label: 'Supply Shortfall',  icon: '⛽' },
}

function normalise(e) {
  const meta = TYPE_META[e.type] || { severity: 'MEDIUM', label: e.type, icon: '⚡' }
  const p = e.parameters || {}
  /* build a readable description from parameters */
  const parts = []
  if (p.reason)      parts.push(p.reason)
  if (p.station_id)  parts.push(`Station: ${p.station_id}`)
  if (p.route_id)    parts.push(`Route: ${p.route_id}`)
  if (p.multiplier)  parts.push(`Demand ×${p.multiplier}`)
  if (p.depot_id)    parts.push(`Depot: ${p.depot_id}`)
  const affectedStations = p.station_id ? [p.station_id] : []
  const affectedRoutes   = p.route_id   ? [p.route_id]   : []
  return {
    ...e,
    severity:          e.severity || meta.severity,
    label:             meta.label,
    icon:              meta.icon,
    description:       parts.join(' · ') || null,
    affectedStations,
    affectedRoutes,
  }
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const poll = () => api.events()
      .then(d => { setEvents(Array.isArray(d) ? d.map(normalise) : []); setLoading(false) })
      .catch(() => setLoading(false))
    poll()
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: 'white', borderRadius: 12, padding: '16px 20px',
          border: '1px solid #eef1f6', borderLeft: '4px solid #e2e8f0' }}>
          <div style={{ height: 14, width: 180, background: '#f1f5f9', borderRadius: 4, marginBottom: 8 }}/>
          <div style={{ height: 12, width: '55%', background: '#f1f5f9', borderRadius: 4 }}/>
        </div>
      ))}
    </div>
  )

  const active   = events.filter(e => e.status === 'ACTIVE')
  const scheduled = events.filter(e => e.status === 'SCHEDULED')
  const done     = events.filter(e => !['ACTIVE','SCHEDULED'].includes(e.status))
  const ordered  = [...active, ...scheduled, ...done]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Disruption Events</h2>
        {active.length > 0 && (
          <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {active.length} Active
          </span>
        )}
        {scheduled.length > 0 && (
          <span style={{ background: '#fff7ed', color: '#f97316', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {scheduled.length} Scheduled
          </span>
        )}
        <span style={{ color: '#94a3b8', fontSize: 12 }}>· updates every 10s</span>
      </div>

      {!events.length && (
        <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', border: '1px solid #eef1f6' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No disruptions — network operating normally</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ordered.map((e) => {
          const s = SEV[e.severity] || SEV.MEDIUM
          const isActive = e.status === 'ACTIVE'
          const isScheduled = e.status === 'SCHEDULED'
          return (
            <div key={e.id} style={{
              background: 'white', borderRadius: 12, padding: '16px 20px',
              border: '1px solid #eef1f6', borderLeft: `4px solid ${s.border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              opacity: (!isActive && !isScheduled) ? 0.55 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 18 }}>{e.icon}</span>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{e.label}</span>
                  <span style={{
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  }}>{e.severity}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                    background: isActive ? '#fef2f2' : isScheduled ? '#fff7ed' : '#f1f5f9',
                    color:      isActive ? '#dc2626' : isScheduled ? '#f97316' : '#64748b',
                  }}>{e.status}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                  <div>Tick {e.start_tick} → {e.end_tick}</div>
                </div>
              </div>

              {e.description && (
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>{e.description}</p>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {e.affectedStations.map(sid => (
                  <span key={sid} style={{
                    background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                  }}>📍 {sid}</span>
                ))}
                {e.affectedRoutes.map(rid => (
                  <span key={rid} style={{
                    background: '#fff7ed', color: '#f97316', border: '1px solid #fdba74',
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                  }}>🛣️ {rid}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* How to inject events */}
      <div style={{ marginTop: 24, background: '#f8f9fc', borderRadius: 12, padding: '16px 20px', border: '1px solid #eef1f6' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Inject Test Events
        </div>
        <code style={{ fontSize: 11, color: '#475569', display: 'block', lineHeight: 1.8 }}>
          {`# Demand spike at Mirpur (3× demand for 10 ticks)`}<br/>
          {`curl -X POST http://localhost:8000/admin/events -H "Content-Type: application/json" \\`}<br/>
          {`  -d '{"type":"demand_spike","start_tick":CURRENT,"duration_ticks":10,"parameters":{"station_id":"station-mirpur","multiplier":3.0}}'`}
        </code>
      </div>
    </div>
  )
}
