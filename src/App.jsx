import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Phase1 from './pages/Phase1'
import Phase2 from './pages/Phase2'
import Phase3 from './pages/Phase3'
import Phase4 from './pages/Phase4'
import Phase5 from './pages/Phase5'
import Phase6 from './pages/Phase6'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import Layout from './components/Layout'

export const API_URL = 'http://localhost:5000/api'

function App() {
  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem('codehunt_team')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (team) {
      localStorage.setItem('codehunt_team', JSON.stringify(team))
    }
  }, [team])

  return (
    <Layout team={team}>
      <Routes>
        <Route path="/" element={<LandingPage team={team} setTeam={setTeam} />} />
        <Route path="/phase1" element={<Phase1 team={team} setTeam={setTeam} />} />
        <Route path="/phase2" element={<Phase2 team={team} setTeam={setTeam} />} />
        <Route path="/phase3" element={<Phase3 team={team} setTeam={setTeam} />} />
        <Route path="/phase4" element={<Phase4 team={team} setTeam={setTeam} />} />
        <Route path="/phase5" element={<Phase5 team={team} setTeam={setTeam} />} />
        <Route path="/phase6" element={<Phase6 team={team} setTeam={setTeam} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  )
}

export default App
