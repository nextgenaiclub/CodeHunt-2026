import { useState, useEffect } from 'react'
import { Trophy, Clock, Medal, RefreshCw } from 'lucide-react'
import { API_URL } from '../App'

export default function Leaderboard() {
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(new Date())

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_URL}/leaderboard`)
            const data = await res.json()
            setTeams(data)
            setLastUpdate(new Date())
        } catch (err) {
            console.error('Failed to load leaderboard')
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLeaderboard()
        const interval = setInterval(fetchLeaderboard, 30000) // Auto-refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const formatTime = (seconds) => {
        if (!seconds) return '--'
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        if (hrs > 0) {
            return `${hrs}h ${mins}m ${secs}s`
        }
        return `${mins}m ${secs}s`
    }

    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return rank
    }

    return (
        <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <Trophy size={60} style={{ color: '#FFD700', marginBottom: '20px' }} />
                <h1>Leaderboard</h1>
                <p style={{ fontSize: '1.1rem', marginTop: '15px' }}>
                    Top teams who completed CodeHunt-2026
                </p>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <button onClick={fetchLeaderboard} className="btn btn-secondary btn-small">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" />
                    <p>Loading leaderboard...</p>
                </div>
            ) : teams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Medal size={60} style={{ color: '#666', marginBottom: '20px' }} />
                    <h3 style={{ color: '#666' }}>No teams have completed yet</h3>
                    <p>Be the first to finish CodeHunt-2026!</p>
                </div>
            ) : (
                <div className="leaderboard">
                    {/* Top 3 Podium */}
                    {teams.length >= 3 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            gap: '20px',
                            marginBottom: '50px',
                            flexWrap: 'wrap'
                        }}>
                            {/* 2nd Place */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '10px'
                                }}>🥈</div>
                                <div style={{
                                    background: 'linear-gradient(to top, #C0C0C0, transparent)',
                                    padding: '30px 40px',
                                    borderRadius: '12px 12px 0 0',
                                    minHeight: '100px'
                                }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '5px' }}>
                                        {teams[1]?.teamName}
                                    </h3>
                                    <p style={{ color: '#C0C0C0', fontFamily: 'Orbitron', margin: 0 }}>
                                        {formatTime(teams[1]?.totalTimeSeconds)}
                                    </p>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '4rem',
                                    marginBottom: '10px',
                                    animation: 'float 3s ease-in-out infinite'
                                }}>👑</div>
                                <div style={{
                                    background: 'linear-gradient(to top, #FFD700, transparent)',
                                    padding: '40px 50px',
                                    borderRadius: '12px 12px 0 0',
                                    minHeight: '140px',
                                    boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
                                }}>
                                    <h3 style={{ color: '#000', fontSize: '1.3rem', marginBottom: '5px' }}>
                                        {teams[0]?.teamName}
                                    </h3>
                                    <p style={{ color: '#000', fontFamily: 'Orbitron', margin: 0, fontWeight: 'bold' }}>
                                        {formatTime(teams[0]?.totalTimeSeconds)}
                                    </p>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '10px'
                                }}>🥉</div>
                                <div style={{
                                    background: 'linear-gradient(to top, #CD7F32, transparent)',
                                    padding: '25px 35px',
                                    borderRadius: '12px 12px 0 0',
                                    minHeight: '80px'
                                }}>
                                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '5px' }}>
                                        {teams[2]?.teamName}
                                    </h3>
                                    <p style={{ color: '#CD7F32', fontFamily: 'Orbitron', margin: 0 }}>
                                        {formatTime(teams[2]?.totalTimeSeconds)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full List */}
                    {teams.map((team, index) => (
                        <div
                            key={team.teamId || index}
                            className={`leaderboard-item ${index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : ''}`}
                        >
                            <div className="leaderboard-rank">
                                {getRankIcon(index + 1)}
                            </div>
                            <div className="leaderboard-info">
                                <div className="leaderboard-team">{team.teamName}</div>
                                <div className="leaderboard-leader">Led by {team.teamLeader}</div>
                            </div>
                            <div className="leaderboard-time">
                                <Clock size={16} style={{ marginRight: '8px' }} />
                                {formatTime(team.totalTimeSeconds)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
