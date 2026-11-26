import { useState, useEffect } from 'react'
import { api } from '../api/client'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  return diff < 1 ? 'just now' : `${diff}m ago`
}

function ImpactBar({ quantity }) {
  const litres = Math.round(quantity)
  return (
    <span style={{
      background: '#052e16', color: '#4ade80', fontSize: '0.75rem',
      padding: '0.1rem 0.5rem', borderRadius: 4, fontWeight: 600
    }}>+{litres.toLocaleString()}L dispatched</span>
  )
}

export default function Decisions() {
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.decisions(20).then(d => { setDecisions(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#475569' }}>Loading decisions...</p>

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        AI Allocation Decisions
        <span style={{ color: '#475569', fontWeight: 400, fontSize: '0.9rem' }}> ({decisions.length})</span>
      </h2>
      {!decisions.length && (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#475569', margin: 0 }}>No decisions yet — agents have not run.</p>
          <p style={{ color: '#334155', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Agents run when a station drops below 25% capacity.
          </p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {decisions.map(d => (
          <div key={d.id} style={{
            background: '#1e293b', borderRadius: 8, padding: '1rem 1.25rem',
            borderLeft: '3px solid #38bdf8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{d.station_name || d.station_id}</span>
                <span style={{
                  color: '#38bdf8', fontSize: '0.78rem', background: '#0f172a',
                  padding: '0.1rem 0.4rem', borderRadius: 4
                }}>{d.fuel_type}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>from {d.depot_id} via {d.route_id}</span>
                <ImpactBar quantity={d.quantity} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                <span style={{ color: '#475569', fontSize: '0.72rem' }}>{timeAgo(d.created_at)}</span>
                <span style={{
                  color: d.status === 'SUBMITTED' ? '#4ade80' : '#fbbf24',
                  fontSize: '0.72rem', fontWeight: 600
                }}>{d.status}</span>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{d.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
