import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = { dashboard: <Dashboard /> }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ padding: '2rem' }}>
        {pages[page] || <p style={{ color: '#475569' }}>Coming soon...</p>}
      </main>
    </div>
  )
}
