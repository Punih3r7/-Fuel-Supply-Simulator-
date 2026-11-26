import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Decisions from './pages/Decisions'
import Events from './pages/Events'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    alerts: <Alerts />,
    decisions: <Decisions />,
    events: <Events />,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ padding: '2rem' }}>
        {pages[page]}
      </main>
    </div>
  )
}
