import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Decisions from './pages/Decisions'
import Events from './pages/Events'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    alerts:    <Alerts />,
    decisions: <Decisions />,
    events:    <Events />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9' }}>
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header page={page} />
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {pages[page]}
        </main>
      </div>
    </div>
  )
}
