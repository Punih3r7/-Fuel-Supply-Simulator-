import { useState } from 'react'
import Header from './components/Header'

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header page={page} setPage={setPage} />
      <main style={{ padding: '2rem' }}>
        <p style={{ color: '#475569' }}>Loading {page}...</p>
      </main>
    </div>
  )
}
