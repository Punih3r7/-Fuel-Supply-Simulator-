const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: GridIcon },
  { key: 'alerts',    label: 'Alerts',    icon: BellIcon },
  { key: 'decisions', label: 'Decisions', icon: ClipboardIcon },
  { key: 'events',    label: 'Events',    icon: ZapIcon },
]

export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width: 68, background: '#1a1a2e', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '18px 0 24px', gap: 6, flexShrink: 0,
      minHeight: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        width: 38, height: 38, background: 'linear-gradient(135deg,#f97316,#fb923c)',
        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, flexShrink: 0,
      }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" strokeLinejoin="round"/>
        </svg>
      </div>

      {NAV.map(({ key, label, icon: Icon }) => {
        const active = page === key
        return (
          <button key={key} onClick={() => setPage(key)} title={label} style={{
            width: 46, height: 46,
            background: active ? 'rgba(249,115,22,0.18)' : 'transparent',
            border: active ? '1px solid rgba(249,115,22,0.35)' : '1px solid transparent',
            borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: active ? '#f97316' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.15s',
          }}>
            <Icon />
          </button>
        )
      })}
    </aside>
  )
}

function GridIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinejoin="round"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinejoin="round"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinejoin="round"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  )
}
function ClipboardIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/>
    </svg>
  )
}
function ZapIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round"/>
    </svg>
  )
}
