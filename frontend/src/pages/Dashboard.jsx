import { useState, useEffect } from 'react'
import { api } from '../api/client'

/* ── Shared card wrapper ── */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eef1f6',
      ...style,
    }}>{children}</div>
  )
}

/* ── Stat card (top row) ── */
function StatCard({ title, value, sub, subUp, iconBg, children }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
        <div style={{ width: 40, height: 40, background: iconBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {children}
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#1e293b', margin: '10px 0 8px', lineHeight: 1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: subUp ? '#16a34a' : '#dc2626' }}>
          <span style={{ fontSize: 14 }}>{subUp ? '↑' : '↓'}</span>
          <span>{sub}</span>
        </div>
      )}
    </Card>
  )
}

/* ── SVG Line chart ── */
function DemandLineChart({ data }) {
  const [hover, setHover] = useState(null)
  if (!data.length) return <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>Loading chart data…</div>

  const W = 700, H = 160, PL = 42, PR = 16, PT = 12, PB = 28
  const IW = W - PL - PR, IH = H - PT - PB
  const vals = data.map(d => d.v)
  const max = Math.max(...vals, 1)
  const min = 0

  const pts = data.map((d, i) => ({
    x: PL + (data.length === 1 ? 0.5 : i / (data.length - 1)) * IW,
    y: PT + (1 - (d.v - min) / (max - min)) * IH,
    d,
  }))

  /* smooth bezier path */
  const linePath = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pts[i - 1]
    const cpx = (prev.x + p.x) / 2
    return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`
  }).join(' ')

  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PT + IH} L ${pts[0].x} ${PT + IH} Z`

  const ySteps = [0, 25, 50, 75, 100].map(pct => ({
    label: Math.round(min + (max - min) * pct / 100),
    y: PT + (1 - pct / 100) * IH,
  }))

  /* x-axis: show up to 10 labels evenly */
  const step = Math.max(1, Math.floor(data.length / 10))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}
      onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.01"/>
        </linearGradient>
      </defs>

      {/* Y grid + labels */}
      {ySteps.map(({ label, y }) => (
        <g key={label}>
          <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
          <text x={PL - 6} y={y + 4} fontSize="9" fill="#b0bec5" textAnchor="end">{label}</text>
        </g>
      ))}

      {/* Area + line */}
      <path d={areaPath} fill="url(#areaGrad)"/>
      <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.4" strokeLinecap="round"/>

      {/* X labels */}
      {pts.filter((_, i) => i % step === 0).map((p, i) => (
        <text key={i} x={p.x} y={H - 4} fontSize="9" fill="#b0bec5" textAnchor="middle">{p.d.label}</text>
      ))}

      {/* Hover dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="transparent" stroke="transparent"
          onMouseEnter={() => setHover(p)}
          style={{ cursor: 'crosshair' }}/>
      ))}

      {/* Tooltip */}
      {hover && (
        <g>
          <line x1={hover.x} x2={hover.x} y1={PT} y2={PT + IH} stroke="#f97316" strokeWidth="1" strokeDasharray="3,2"/>
          <circle cx={hover.x} cy={hover.y} r="4" fill="#f97316" stroke="white" strokeWidth="2"/>
          <rect x={hover.x - 36} y={hover.y - 26} width={72} height={18} rx="4" fill="#1e293b"/>
          <text x={hover.x} y={hover.y - 13} fontSize="10" fill="white" textAnchor="middle" fontWeight="600">
            {Math.round(hover.d.v).toLocaleString()} L
          </text>
        </g>
      )}
    </svg>
  )
}

/* ── SVG Bar chart (station comparison) ── */
function StationBarChart({ stations }) {
  if (!stations.length) return null
  const FUELS = ['DIESEL', 'PETROL', 'OCTANE']
  const COLORS = { DIESEL: '#f97316', PETROL: '#4ade80', OCTANE: '#facc15' }
  const W = 340, H = 180, PL = 24, PB = 48, PR = 8, PT = 12
  const IW = W - PL - PR, IH = H - PT - PB
  const groups = stations.length
  const barsPerGroup = FUELS.length
  const groupW = IW / groups
  const barW = groupW / (barsPerGroup + 1)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <line key={v} x1={PL} x2={W - PR} y1={PT + (1 - v / 100) * IH} y2={PT + (1 - v / 100) * IH} stroke="#f1f5f9" strokeWidth="1"/>
        ))}

        {stations.map((s, si) => {
          const gx = PL + si * groupW + barW * 0.5
          return FUELS.map((fuel, fi) => {
            const inv = s.inventory?.[fuel] || 0
            const cap = s.capacity?.[fuel] || 1
            const pct = inv / cap
            const bh = Math.max(pct * IH, 1)
            const bx = gx + fi * barW
            const by = PT + IH - bh
            return (
              <rect key={fuel} x={bx} y={by} width={barW * 0.78} height={bh}
                fill={COLORS[fuel]} rx="2" opacity="0.88"/>
            )
          })
        })}

        {/* Station labels */}
        {stations.map((s, si) => (
          <text key={si} x={PL + si * groupW + groupW / 2} y={H - PT - 2}
            fontSize="8" fill="#94a3b8" textAnchor="middle">
            {s.name?.split(' ')[0]}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 4 }}>
        {FUELS.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <div style={{ width: 10, height: 10, background: COLORS[f], borderRadius: 2 }}/>
            {f}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── SVG Donut chart ── */
function DonutChart({ stations }) {
  const FUELS = ['DIESEL', 'PETROL', 'OCTANE']
  const COLORS = { DIESEL: '#f97316', PETROL: '#4ade80', OCTANE: '#facc15' }
  const totals = {}
  FUELS.forEach(f => { totals[f] = stations.reduce((s, st) => s + (st.inventory?.[f] || 0), 0) })
  const grand = Object.values(totals).reduce((a, b) => a + b, 0)

  if (!grand) return <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>No inventory data</div>

  const cx = 80, cy = 80, R = 64, r = 42
  let angle = -Math.PI / 2

  const arc = (a0, a1) => {
    const x1 = cx + R * Math.cos(a0), y1 = cy + R * Math.sin(a0)
    const x2 = cx + R * Math.cos(a1), y2 = cy + R * Math.sin(a1)
    const x3 = cx + r * Math.cos(a1), y3 = cy + r * Math.sin(a1)
    const x4 = cx + r * Math.cos(a0), y4 = cy + r * Math.sin(a0)
    const lg = a1 - a0 > Math.PI ? 1 : 0
    return `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${lg} 0 ${x4} ${y4}Z`
  }

  const slices = FUELS.map(f => {
    const frac = totals[f] / grand
    const a0 = angle
    angle += frac * 2 * Math.PI
    return { f, frac, a0, a1: angle }
  })

  const totalKL = (grand / 1000).toFixed(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map(({ f, a0, a1 }) => (
          <path key={f} d={arc(a0, a1)} fill={COLORS[f]} opacity="0.9"/>
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e293b">{totalKL}kL</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">Total Stock</text>
      </svg>
      <div style={{ display: 'flex', gap: 14 }}>
        {FUELS.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <div style={{ width: 9, height: 9, background: COLORS[f], borderRadius: '50%' }}/>
            {f} {Math.round(totals[f] / grand * 100)}%
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── System status widget ── */
function SystemStatus({ status }) {
  if (!status) return null
  const cb = status.circuit_breaker
  const cbColor = cb === 'closed' ? '#16a34a' : cb === 'open' ? '#dc2626' : '#d97706'
  const cbBg   = cb === 'closed' ? '#f0fdf4' : cb === 'open' ? '#fef2f2' : '#fffbeb'

  const row = (label, val, color, bg) => (
    <div style={{ background: bg || '#f8f9fc', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{val}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {row('Circuit Breaker', cb?.toUpperCase(), cbColor, cbBg)}
      {row('Backend', status.backend === 'ok' ? '● Online' : '● Offline',
        status.backend === 'ok' ? '#16a34a' : '#dc2626')}
      {row('Simulator', status.simulator === 'ok' ? '● Online' : '● Degraded',
        status.simulator === 'ok' ? '#16a34a' : '#f59e0b')}
      {row('Active Alerts', status.active_alerts,
        status.critical_alerts > 0 ? '#dc2626' : '#1e293b')}
    </div>
  )
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const [stations, setStations]   = useState([])
  const [status, setStatus]       = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [sts, stat, hist] = await Promise.all([
          api.stations(), api.systemStatus(), api.demandHistory(60),
        ])
        setStations(sts)
        setStatus(stat)

        /* Aggregate demand by tick for the line chart */
        const byTick = {}
        hist.forEach(row => {
          byTick[row.tick] = (byTick[row.tick] || 0) + (row.demand_liters || 0)
        })
        const ticks = Object.keys(byTick).map(Number).sort((a, b) => a - b)
        setChartData(ticks.map(t => ({ label: `T${t}`, v: byTick[t] })))
      } catch {}
    }
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  const totalCap = stations.reduce((s, st) => s + Object.values(st.capacity  || {}).reduce((a, b) => a + b, 0), 0)
  const totalInv = stations.reduce((s, st) => s + Object.values(st.inventory || {}).reduce((a, b) => a + b, 0), 0)
  const fillPct  = totalCap ? Math.round(totalInv / totalCap * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* ── Top stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
        <StatCard title="Total Stations" value={stations.length} sub="4 Active" subUp={true} iconBg="#eff6ff">
          🏪
        </StatCard>
        <StatCard
          title="Active Alerts"
          value={status?.active_alerts ?? '—'}
          sub={status?.critical_alerts > 0 ? `${status.critical_alerts} Critical` : 'No critical'}
          subUp={status?.critical_alerts === 0}
          iconBg="#fff7ed"
        >🔔</StatCard>
        <StatCard
          title="AI Decisions"
          value={status?.total_decisions ?? '—'}
          sub="Dispatched by agents"
          subUp={true}
          iconBg="#f0fdf4"
        >⚡</StatCard>
        <StatCard
          title="Avg Fill Level"
          value={`${fillPct}%`}
          sub={fillPct < 25 ? 'Critical low' : fillPct < 50 ? 'Low' : 'Normal'}
          subUp={fillPct >= 25}
          iconBg="#fdf4ff"
        >⛽</StatCard>
      </div>

      {/* ── Main line chart ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Demand History</div>
          <span style={{ background: '#fff7ed', color: '#f97316', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            Live
          </span>
        </div>
        <DemandLineChart data={chartData} />
      </Card>

      {/* ── Bottom row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>Station Comparison</div>
          <StationBarChart stations={stations} />
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>Fuel Distribution</div>
          <DonutChart stations={stations} />
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>System Status</div>
          <SystemStatus status={status} />
        </Card>
      </div>
    </div>
  )
}
