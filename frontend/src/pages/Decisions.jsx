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

  if (loading) return <p style={{ color: '#475569' }}>Loading decisions...</p>

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        AI Allocation Decisions <span style={{ color: '#475569', fontWeight: 400, fontSize: '0.9rem' }}>({decisions.length})</span>
      </h2>
      {!decisions.length && <p style={{ color: '#475569' }}>No decisions yet — agents have not run.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {decisions.map(d => (
          <div key={d.id} style={{ background: '#1e293b', borderRadius: 8, padding: '1rem 1.25rem', borderLeft: '3px solid #38bdf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{d.station_id}</span>
                <span style={{ color: '#38bdf8', fontSize: '0.8rem', background: '#0f172a', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{d.fuel_type}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{Math.round(d.quantity)}L from {d.depot_id}</span>
              </div>
              <span style={{ color: '#475569', fontSize: '0.75rem' }}>{timeAgo(d.created_at)}</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>{d.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
