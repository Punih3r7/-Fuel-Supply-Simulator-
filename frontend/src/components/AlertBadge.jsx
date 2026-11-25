const colors = {
  CRITICAL: { bg: '#7f1d1d', text: '#fca5a5' },
  HIGH:     { bg: '#7c2d12', text: '#fdba74' },
  MEDIUM:   { bg: '#713f12', text: '#fde047' },
  LOW:      { bg: '#14532d', text: '#86efac' },
}

export default function AlertBadge({ level }) {
  const c = colors[level] || colors.LOW
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 4, letterSpacing: '0.05em' }}>
      {level}
    </span>
  )
}
