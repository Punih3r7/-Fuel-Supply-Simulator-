import { useState, useEffect } from 'react'
import { api } from '../api/client'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  return diff < 1 ? 'just now' : `${diff}m ago`
}

export default function Decisions() {
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.decisions(20).then(d => { setDecisions(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#94a3b8' }}>Loading decisions…</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>AI Allocation Decisions</h2>
        <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {decisions.length}
        </span>
      </div>

      {!decisions.length && (
        <div style={{ background: 'white', borderRadius: 12, padding: '48px', textAlign: 'center', border: '1px solid #eef1f6' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No decisions yet — agents have not run</p>
          <p style={{ color: '#cbd5e1', fontSize: 12, marginTop: 6 }}>Agents activate when a station drops below 25% capacity</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {decisions.map(d => (
          <div key={d.id} style={{
            background: 'white', borderRadius: 12, padding: '16px 20px',
            border: '1px solid #eef1f6', borderLeft: '4px solid #38bdf8',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{d.station_name || d.station_id}</span>
                <span style={{
                  background: '#fff7ed', color: '#f97316',
                  padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                }}>{d.fuel_type}</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>from {d.depot_id} via {d.route_id}</span>
                <span style={{
                  background: '#f0fdf4', color: '#16a34a',
                  padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                }}>+{Math.round(d.quantity).toLocaleString()}L dispatched</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{timeAgo(d.created_at)}</span>
                <span style={{
                  background: d.status === 'SUBMITTED' ? '#f0fdf4' : '#fff7ed',
                  color:      d.status === 'SUBMITTED' ? '#16a34a' : '#f97316',
                  padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                }}>{d.status}</span>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{d.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
