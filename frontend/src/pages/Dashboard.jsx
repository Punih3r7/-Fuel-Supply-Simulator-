import { useState, useEffect } from 'react'
import { api } from '../api/client'

/* ─── CSS animations injected once ─── */
const ANIM_CSS = `
  @keyframes eq1 { 0%,100%{height:10px} 50%{height:52px} }
  @keyframes eq2 { 0%,100%{height:32px} 50%{height:8px}  }
  @keyframes eq3 { 0%,100%{height:18px} 33%{height:48px} 66%{height:12px} }
  @keyframes eq4 { 0%,100%{height:40px} 50%{height:14px} }
  @keyframes eq5 { 0%,100%{height:14px} 25%{height:44px} 75%{height:20px} }
  @keyframes eq6 { 0%,100%{height:28px} 40%{height:8px}  80%{height:54px} }
  @keyframes eq7 { 0%,100%{height:22px} 60%{height:50px} }
  @keyframes eq8 { 0%,100%{height:8px}  50%{height:36px} }
  @keyframes pulseRing { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.8);opacity:0} }
  @keyframes floatUp { 0%{opacity:0;transform:translateY(10px)} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0;transform:translateY(-18px)} }
  @keyframes fadeSlide { 0%{opacity:0;transform:translateX(-6px)} 100%{opacity:1;transform:translateX(0)} }
`

/* ─── Shared card ─── */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eef1f6',
      ...style,
    }}>{children}</div>
  )
}

/* ─── Stat card ─── */
function StatCard({ title, value, sub, subUp, iconBg, children }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
        <div style={{ width: 40, height: 40, background: iconBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {children}
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#1e293b', margin: '10px 0 8px', lineHeight: 1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: subUp ? '#16a34a' : '#dc2626' }}>
          <span>{subUp ? '↑' : '↓'}</span><span>{sub}</span>
        </div>
      )}
    </Card>
  )
}

/* ─── Station info card ─── */
const FUEL_COLORS = { DIESEL: '#f97316', PETROL: '#4ade80', OCTANE: '#a78bfa' }
const FUELS = ['DIESEL', 'PETROL', 'OCTANE']

function StationInfoCard({ station }) {
  const fills = FUELS.map(f => {
    const inv = station.inventory?.[f] || 0
    const cap = station.capacity?.[f] || 1
    return { fuel: f, pct: Math.round(inv / cap * 100), inv: Math.round(inv), cap }
  })
  const avg = Math.round(fills.reduce((s, f) => s + f.pct, 0) / fills.length)
  const statusColor = avg > 50 ? '#16a34a' : avg > 25 ? '#d97706' : '#dc2626'
  const statusBg    = avg > 50 ? '#f0fdf4' : avg > 25 ? '#fffbeb' : '#fef2f2'

  return (
    <Card style={{ padding: '18px 20px', animation: 'fadeSlide 0.4s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{station.name}</div>
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{station.id}</div>
        </div>
        <span style={{
          background: station.status === 'OPEN' ? '#f0fdf4' : '#fef2f2',
          color: station.status === 'OPEN' ? '#16a34a' : '#dc2626',
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
        }}>● {station.status}</span>
      </div>

      {fills.map(({ fuel, pct, inv }) => (
        <div key={fuel} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>{fuel}</span>
            <span style={{ fontWeight: 700, color: pct < 25 ? '#dc2626' : pct < 50 ? '#d97706' : '#16a34a' }}>
              {inv.toLocaleString()}L · {pct}%
            </span>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: FUEL_COLORS[fuel], borderRadius: 4,
              width: `${pct}%`, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
            }}/>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: statusBg, borderRadius: 10, padding: '10px 14px' }}>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>Avg Fill Level</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: statusColor }}>{avg}%</div>
      </div>
    </Card>
  )
}

/* ─── Animated fuel pulse (equalizer) ─── */
function FuelPulse({ stations }) {
  const [floats, setFloats] = useState([])

  /* randomly spawn floating +/- labels for life */
  useEffect(() => {
    if (!stations.length) return
    const fuels = FUELS
    const timer = setInterval(() => {
      const fuel = fuels[Math.floor(Math.random() * fuels.length)]
      const inv  = stations.reduce((s, st) => s + (st.inventory?.[fuel] || 0), 0)
      const cap  = stations.reduce((s, st) => s + (st.capacity?.[fuel]  || 0), 0)
      const pct  = cap ? Math.round(inv / cap * 100) : 0
      const up   = Math.random() > 0.5
      setFloats(f => [...f.slice(-8), { id: Date.now(), fuel, pct, up, left: 10 + Math.random() * 80 }])
    }, 1800)
    return () => clearInterval(timer)
  }, [stations])

  const rows = FUELS.map(fuel => {
    const inv = stations.reduce((s, st) => s + (st.inventory?.[fuel] || 0), 0)
    const cap = stations.reduce((s, st) => s + (st.capacity?.[fuel]  || 0), 0)
    const pct = cap ? Math.round(inv / cap * 100) : 0
    return { fuel, pct }
  })

  const EQ_DELAYS = [0, 0.18, 0.36, 0.09, 0.27, 0.45, 0.14, 0.32]
  const EQ_DUR    = [1.1, 0.9, 1.3, 0.85, 1.05, 0.95, 1.2, 0.8]

  return (
    <Card style={{ position: 'relative', overflow: 'hidden', minHeight: 240 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>
        Live Fuel Pulse
        <span style={{ marginLeft: 10, display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
          background: '#f97316', position: 'relative', top: -1,
          boxShadow: '0 0 0 0 rgba(249,115,22,0.6)',
          animation: 'pulseRing 1.4s ease-out infinite',
        }}/>
      </div>

      {/* Floating ticker labels */}
      {floats.map(f => (
        <div key={f.id} style={{
          position: 'absolute', left: `${f.left}%`, bottom: 32,
          fontSize: 11, fontWeight: 700, pointerEvents: 'none',
          color: f.up ? '#16a34a' : '#dc2626',
          animation: 'floatUp 2.4s ease-out forwards',
        }}>
          {f.up ? '▲' : '▼'} {f.fuel} {f.pct}%
        </div>
      ))}

      {/* Equalizer bars per fuel type */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        {rows.map(({ fuel, pct }) => {
          const color = FUEL_COLORS[fuel]
          const scaledPct = Math.max(pct, 5)
          return (
            <div key={fuel} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {/* Bars */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 72 }}>
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} style={{
                    width: 7, background: `linear-gradient(to top, ${color}, ${color}88)`,
                    borderRadius: '3px 3px 1px 1px',
                    animation: `eq${i} ${EQ_DUR[i-1]}s ease-in-out infinite`,
                    animationDelay: `${EQ_DELAYS[i-1]}s`,
                    opacity: 0.75 + (scaledPct / 400),
                  }}/>
                ))}
              </div>

              {/* Percentage ring */}
              <div style={{ position: 'relative', width: 56, height: 56 }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#f1f5f9" strokeWidth="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22 * scaledPct / 100} 999`}
                    strokeDashoffset={2 * Math.PI * 22 * 0.25}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)' }}
                  />
                  <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">{pct}%</text>
                </svg>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.04em' }}>{fuel}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/* ─── SVG Line chart ─── */
function DemandLineChart({ data }) {
  const [hover, setHover] = useState(null)
  if (!data.length) return (
    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
      Waiting for simulation data…
    </div>
  )

  const W = 680, H = 160, PL = 42, PR = 16, PT = 12, PB = 28
  const IW = W - PL - PR, IH = H - PT - PB
  const vals = data.map(d => d.v)
  const max = Math.max(...vals, 1), min = 0

  const pts = data.map((d, i) => ({
    x: PL + (data.length === 1 ? 0.5 : i / (data.length - 1)) * IW,
    y: PT + (1 - (d.v - min) / (max - min)) * IH, d,
  }))

  const linePath = pts.map((p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`
    const prev = pts[i - 1], cpx = (prev.x + p.x) / 2
    return `C${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`
  }).join(' ')

  const areaPath = `${linePath} L${pts[pts.length-1].x} ${PT+IH} L${pts[0].x} ${PT+IH}Z`
  const ySteps = [0, 25, 50, 75, 100].map(pct => ({
    label: Math.round(max * pct / 100), y: PT + (1 - pct / 100) * IH,
  }))
  const step = Math.max(1, Math.floor(data.length / 9))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}
      onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity=".22"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity=".01"/>
        </linearGradient>
      </defs>
      {ySteps.map(({ label, y }) => (
        <g key={label}>
          <line x1={PL} x2={W-PR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
          <text x={PL-6} y={y+4} fontSize="9" fill="#b0bec5" textAnchor="end">{label}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#ag)"/>
      <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.4" strokeLinecap="round"/>
      {pts.filter((_, i) => i % step === 0).map((p, i) => (
        <text key={i} x={p.x} y={H-4} fontSize="9" fill="#b0bec5" textAnchor="middle">{p.d.label}</text>
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="transparent"
          onMouseEnter={() => setHover(p)} style={{ cursor: 'crosshair' }}/>
      ))}
      {hover && (
        <g>
          <line x1={hover.x} x2={hover.x} y1={PT} y2={PT+IH} stroke="#f97316" strokeWidth="1" strokeDasharray="3,2"/>
          <circle cx={hover.x} cy={hover.y} r="4" fill="#f97316" stroke="white" strokeWidth="2"/>
          <rect x={hover.x-38} y={hover.y-27} width={76} height={19} rx="4" fill="#1e293b"/>
          <text x={hover.x} y={hover.y-13} fontSize="10" fill="white" textAnchor="middle" fontWeight="600">
            {Math.round(hover.d.v).toLocaleString()} L/tick
          </text>
        </g>
      )}
    </svg>
  )
}

/* ─── SVG Bar chart ─── */
function StationBarChart({ stations }) {
  if (!stations.length) return null
  const W = 320, H = 170, PL = 22, PB = 46, PR = 8, PT = 12
  const IW = W - PL - PR, IH = H - PT - PB
  const groupW = IW / stations.length
  const barW = groupW / (FUELS.length + 1)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 25, 50, 75, 100].map(v => (
          <line key={v} x1={PL} x2={W-PR} y1={PT + (1 - v/100) * IH} y2={PT + (1 - v/100) * IH} stroke="#f1f5f9" strokeWidth="1"/>
        ))}
        {stations.map((s, si) => {
          const gx = PL + si * groupW + barW * 0.5
          return FUELS.map((fuel, fi) => {
            const inv = s.inventory?.[fuel] || 0, cap = s.capacity?.[fuel] || 1
            const pct = inv / cap
            const bh = Math.max(pct * IH, 1)
            return <rect key={fuel} x={gx + fi * barW} y={PT + IH - bh} width={barW * 0.76} height={bh} fill={FUEL_COLORS[fuel]} rx="2" opacity="0.85"/>
          })
        })}
        {stations.map((s, si) => (
          <text key={si} x={PL + si * groupW + groupW / 2} y={H - PT - 1} fontSize="8" fill="#94a3b8" textAnchor="middle">
            {s.name?.split(' ')[0]}
          </text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 4 }}>
        {FUELS.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <div style={{ width: 10, height: 10, background: FUEL_COLORS[f], borderRadius: 2 }}/>{f}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SVG Donut chart ─── */
function DonutChart({ stations }) {
  const totals = {}
  FUELS.forEach(f => { totals[f] = stations.reduce((s, st) => s + (st.inventory?.[f] || 0), 0) })
  const grand = Object.values(totals).reduce((a, b) => a + b, 0)
  if (!grand) return <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>No data</div>

  const cx = 80, cy = 80, R = 64, r = 42
  let angle = -Math.PI / 2
  const arc = (a0, a1) => {
    const x1 = cx + R*Math.cos(a0), y1 = cy + R*Math.sin(a0)
    const x2 = cx + R*Math.cos(a1), y2 = cy + R*Math.sin(a1)
    const x3 = cx + r*Math.cos(a1), y3 = cy + r*Math.sin(a1)
    const x4 = cx + r*Math.cos(a0), y4 = cy + r*Math.sin(a0)
    const lg = a1 - a0 > Math.PI ? 1 : 0
    return `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${lg} 0 ${x4} ${y4}Z`
  }
  const slices = FUELS.map(f => {
    const frac = totals[f] / grand
    const a0 = angle; angle += frac * 2 * Math.PI
    return { f, frac, a0, a1: angle }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map(({ f, a0, a1 }) => <path key={f} d={arc(a0, a1)} fill={FUEL_COLORS[f]} opacity="0.9"/>)}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e293b">{(grand/1000).toFixed(1)}kL</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">Total Stock</text>
      </svg>
      <div style={{ display: 'flex', gap: 14 }}>
        {FUELS.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <div style={{ width: 9, height: 9, background: FUEL_COLORS[f], borderRadius: '50%' }}/>
            {f} {Math.round(totals[f] / grand * 100)}%
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── System status widget ─── */
function SystemStatus({ status }) {
  if (!status) return null
  const cb = status.circuit_breaker
  const cbColor = cb === 'closed' ? '#16a34a' : cb === 'open' ? '#dc2626' : '#d97706'
  const cbBg    = cb === 'closed' ? '#f0fdf4' : cb === 'open' ? '#fef2f2' : '#fffbeb'

  const row = (label, val, color, bg) => (
    <div style={{ background: bg || '#f8f9fc', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{val}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {row('Circuit Breaker', cb?.toUpperCase(), cbColor, cbBg)}
      {row('Backend',   status.backend === 'ok'   ? '● Online'  : '● Offline',  status.backend   === 'ok' ? '#16a34a' : '#dc2626')}
      {row('Simulator', status.simulator === 'ok' ? '● Online'  : '● Degraded', status.simulator === 'ok' ? '#16a34a' : '#f59e0b')}
      {row('Active Alerts', status.active_alerts, status.critical_alerts > 0 ? '#dc2626' : '#1e293b')}
    </div>
  )
}

/* ─── MAIN ─── */
export default function Dashboard() {
  const [stations,   setStations]   = useState([])
  const [status,     setStatus]     = useState(null)
  const [chartData,  setChartData]  = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [sts, stat, hist] = await Promise.all([
          api.stations(), api.systemStatus(), api.demandHistory(60),
        ])
        setStations(sts)
        setStatus(stat)

        const byTick = {}
        hist.forEach(r => { byTick[r.tick] = (byTick[r.tick] || 0) + (r.demand_liters || 0) })
        const ticks = Object.keys(byTick).map(Number).sort((a, b) => a - b)
        setChartData(ticks.map(t => ({ label: `T${t}`, v: byTick[t] })))
      } catch {}
    }
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  const totalCap = stations.reduce((s, st) => s + Object.values(st.capacity  || {}).reduce((a,b)=>a+b, 0), 0)
  const totalInv = stations.reduce((s, st) => s + Object.values(st.inventory || {}).reduce((a,b)=>a+b, 0), 0)
  const fillPct  = totalCap ? Math.round(totalInv / totalCap * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{ANIM_CSS}</style>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatCard title="Total Stations" value={stations.length} sub="4 Active" subUp iconBg="#eff6ff">🏪</StatCard>
        <StatCard title="Active Alerts"  value={status?.active_alerts ?? '—'}
          sub={status?.critical_alerts > 0 ? `${status.critical_alerts} Critical` : 'No critical'}
          subUp={status?.critical_alerts === 0} iconBg="#fff7ed">🔔</StatCard>
        <StatCard title="AI Decisions" value={status?.total_decisions ?? '—'} sub="Dispatched" subUp iconBg="#f0fdf4">⚡</StatCard>
        <StatCard title="Avg Fill Level" value={`${fillPct}%`}
          sub={fillPct < 25 ? 'Critical low' : fillPct < 50 ? 'Low' : 'Normal'}
          subUp={fillPct >= 25} iconBg="#fdf4ff">⛽</StatCard>
      </div>

      {/* ── Station cards ── */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Station Inventory
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {stations.map(s => <StationInfoCard key={s.id} station={s} />)}
          {!stations.length && [1,2,3,4].map(i => (
            <div key={i} style={{ background: '#f1f5f9', borderRadius: 14, height: 190, animation: 'pulse 1.5s ease infinite' }}/>
          ))}
        </div>
      </div>

      {/* ── Animated pulse + Line chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        <FuelPulse stations={stations} />
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Demand History</div>
            <span style={{ background: '#fff7ed', color: '#f97316', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Live</span>
          </div>
          <DemandLineChart data={chartData} />
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
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
