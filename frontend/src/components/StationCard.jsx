const riskColor = r => r === 'CRITICAL' ? '#f87171' : r === 'HIGH' ? '#fb923c' : r === 'MEDIUM' ? '#fbbf24' : '#4ade80'

function FuelBar({ type, inventory, capacity }) {
  const pct = capacity > 0 ? Math.min(100, (inventory / capacity) * 100) : 0
  const color = pct < 25 ? '#f87171' : pct < 50 ? '#fbbf24' : '#4ade80'
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 3 }}>
        <span>{type}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div style={{ background: '#0f172a', borderRadius: 4, height: 6 }}>
        <div style={{ background: color, width: `${pct}%`, height: '100%', borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

export default function StationCard({ station }) {
  const inv = station.inventory || {}
  const cap = station.capacity || {}
  const fuels = ['DIESEL', 'PETROL', 'OCTANE']
  const minPct = Math.min(...fuels.map(f => cap[f] > 0 ? (inv[f] || 0) / cap[f] * 100 : 100))

  return (
    <div style={{ background: '#1e293b', borderRadius: 10, padding: '1.25rem', border: `1px solid ${minPct < 25 ? '#f87171' : '#334155'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{station.name || station.id}</div>
          <div style={{ color: '#475569', fontSize: '0.75rem' }}>{station.id}</div>
        </div>
        {minPct < 25 && <span style={{ background: '#7f1d1d', color: '#fca5a5', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 4 }}>LOW</span>}
      </div>
      {fuels.map(f => <FuelBar key={f} type={f} inventory={inv[f] || 0} capacity={cap[f] || 1} />)}
    </div>
  )
}
