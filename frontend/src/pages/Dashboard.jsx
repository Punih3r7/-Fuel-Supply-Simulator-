import { useState, useEffect } from 'react'
import { api } from '../api/client'
import StationCard from '../components/StationCard'

export default function Dashboard() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => api.stations().then(s => { setStations(s); setLoading(false) }).catch(() => setLoading(false))
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <p style={{ color: '#475569' }}>Loading stations...</p>
  if (!stations.length) return <p style={{ color: '#475569' }}>No station data — is the simulator running?</p>

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Station Inventory</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {stations.map(s => <StationCard key={s.id} station={s} />)}
      </div>
    </div>
  )
}
