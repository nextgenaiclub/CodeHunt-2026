import { useState, useEffect } from 'react'
import { Shield, Users, BarChart3, Download, Eye, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { API_URL } from '../App'

export default function Admin() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [teams, setTeams] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [expandedTeam, setExpandedTeam] = useState(null)
    const [filter, setFilter] = useState('all')

    const ADMIN_PASSWORD = 'nextgenai2026' // Simple password protection

    const handleLogin = (e) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            setAuthenticated(true)
            fetchData()
        } else {
            alert('Incorrect password')
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const [teamsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/admin/teams`),
                fetch(`${API_URL}/admin/stats`)
            ])
            const teamsData = await teamsRes.json()
            const statsData = await statsRes.json()
            setTeams(teamsData)
            setStats(statsData)
        } catch (err) {
            console.error('Failed to fetch data')
        }
        setLoading(false)
    }

    const exportCSV = () => {
        const headers = ['Team Name', 'Leader', 'Members', 'Email', 'Current Phase', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Total Time']
        const rows = teams.map(t => [
            t.teamName,
            t.teamLeader,
            t.teamMembers?.join('; '),
            t.email,
            t.currentPhase,
            t.phase1?.completed ? 'Yes' : 'No',
            t.phase2?.completed ? `Yes (${t.phase2.lastScore || t.phase2.scores?.slice(-1)[0] || 0}/10)` : 'No',
            t.phase3?.completed ? `Yes (${t.phase3.score}/5)` : 'No',
            t.phase4?.completed ? 'Yes' : 'No',
            t.phase5?.completed ? `Yes (${t.phase5.score}/5)` : 'No',
            t.phase6?.completed ? 'Yes' : 'No',
            t.totalTimeSeconds ? `${Math.floor(t.totalTimeSeconds / 60)}m ${t.totalTimeSeconds % 60}s` : '-'
        ])

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'codehunt2026_teams.csv'
        a.click()
    }

    const filteredTeams = teams.filter(t => {
        if (filter === 'all') return true
        if (filter === 'completed') return t.phase6?.completed
        if (filter === 'in-progress') return !t.phase6?.completed
        return t.currentPhase === parseInt(filter)
    })

    if (!authenticated) {
        return (
            <div className="container" style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '100px' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <Shield size={50} style={{ color: '#FFD700', marginBottom: '20px' }} />
                    <h2 style={{ marginBottom: '30px' }}>Admin Access</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Login
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ marginBottom: '10px' }}>
                        <Shield size={30} style={{ marginRight: '15px' }} />
                        Admin Dashboard
                    </h1>
                    <p style={{ margin: 0 }}>Manage and monitor CodeHunt-2026 submissions</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchData} className="btn btn-secondary btn-small">
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button onClick={exportCSV} className="btn btn-primary btn-small">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                    <StatCard title="Total Teams" value={stats.totalTeams} icon={<Users />} />
                    <StatCard title="Phase 1" value={stats.phaseStats.phase1} color="#22c55e" />
                    <StatCard title="Phase 2" value={stats.phaseStats.phase2} color="#3b82f6" />
                    <StatCard title="Phase 3" value={stats.phaseStats.phase3} color="#8b5cf6" />
                    <StatCard title="Phase 4" value={stats.phaseStats.phase4} color="#f59e0b" />
                    <StatCard title="Phase 5" value={stats.phaseStats.phase5} color="#ec4899" />
                    <StatCard title="Completed" value={stats.phaseStats.phase6} color="#FFD700" icon={<BarChart3 />} />
                </div>
            )}

            {/* Filter */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <FilterBtn label="All" value="all" current={filter} onClick={setFilter} />
                <FilterBtn label="Completed" value="completed" current={filter} onClick={setFilter} />
                <FilterBtn label="In Progress" value="in-progress" current={filter} onClick={setFilter} />
                <FilterBtn label="Phase 1" value="1" current={filter} onClick={setFilter} />
                <FilterBtn label="Phase 2" value="2" current={filter} onClick={setFilter} />
                <FilterBtn label="Phase 3" value="3" current={filter} onClick={setFilter} />
                <FilterBtn label="Phase 4" value="4" current={filter} onClick={setFilter} />
                <FilterBtn label="Phase 5" value="5" current={filter} onClick={setFilter} />
                <FilterBtn label="Phase 6" value="6" current={filter} onClick={setFilter} />
            </div>

            {/* Teams Table */}
            {loading ? (
                <div style={{ textAlign: 'center' }}><div className="spinner" /></div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #FFD700' }}>
                                <th style={thStyle}>Team</th>
                                <th style={thStyle}>Leader</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Phase</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeams.map(team => (
                                <>
                                    <tr key={team.teamId} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={tdStyle}>{team.teamName}</td>
                                        <td style={tdStyle}>{team.teamLeader}</td>
                                        <td style={tdStyle}>{team.email}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                background: 'rgba(255, 215, 0, 0.2)',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontFamily: 'Orbitron',
                                                fontSize: '0.85rem'
                                            }}>
                                                {team.phase6?.completed ? '✓ Done' : `Phase ${team.currentPhase}`}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <PhaseStatus phases={team} />
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => setExpandedTeam(expandedTeam === team.teamId ? null : team.teamId)}
                                                style={{ background: 'none', border: 'none', color: '#FFD700', cursor: 'pointer' }}
                                            >
                                                {expandedTeam === team.teamId ? <ChevronUp /> : <ChevronDown />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedTeam === team.teamId && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '20px', background: '#1a1a1a' }}>
                                                <TeamDetails team={team} />
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const thStyle = { textAlign: 'left', padding: '15px 10px', color: '#FFD700', fontFamily: 'Orbitron', fontSize: '0.85rem' }
const tdStyle = { padding: '15px 10px', color: '#fff' }

function StatCard({ title, value, icon, color = '#FFD700' }) {
    return (
        <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
        }}>
            {icon && <div style={{ color, marginBottom: '10px' }}>{icon}</div>}
            <div style={{ fontSize: '2rem', fontFamily: 'Orbitron', color }}>{value}</div>
            <div style={{ color: '#b3b3b3', fontSize: '0.85rem', marginTop: '5px' }}>{title}</div>
        </div>
    )
}

function FilterBtn({ label, value, current, onClick }) {
    return (
        <button
            onClick={() => onClick(value)}
            style={{
                padding: '8px 16px',
                background: current === value ? '#FFD700' : 'transparent',
                color: current === value ? '#000' : '#fff',
                border: '1px solid #FFD700',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: 'Orbitron',
                fontSize: '0.8rem'
            }}
        >
            {label}
        </button>
    )
}

function PhaseStatus({ phases }) {
    const dots = [1, 2, 3, 4, 5, 6].map(p => {
        const phaseKey = `phase${p}`
        const completed = phases[phaseKey]?.completed
        return (
            <span key={p} style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: completed ? '#22c55e' : '#333',
                display: 'inline-block', marginRight: '4px'
            }} title={`Phase ${p}: ${completed ? 'Completed' : 'Pending'}`} />
        )
    })
    return <div>{dots}</div>
}

function TeamDetails({ team }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
                <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Team Info</h4>
                <p><strong>Members:</strong> {team.teamMembers?.join(', ')}</p>
                <p><strong>Registered:</strong> {new Date(team.createdAt).toLocaleString()}</p>
                {team.totalTimeSeconds && (
                    <p><strong>Total Time:</strong> {Math.floor(team.totalTimeSeconds / 60)}m {team.totalTimeSeconds % 60}s</p>
                )}
            </div>

            <div>
                <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Phase 1</h4>
                {team.phase1?.completed ? (
                    <>
                        <p><strong>Drive Link:</strong> <a href={team.phase1.driveLink} target="_blank" style={{ color: '#3b82f6' }}>View</a></p>
                        <p><strong>Prompt:</strong> {team.phase1.aiPrompt?.substring(0, 100)}...</p>
                    </>
                ) : <p style={{ color: '#666' }}>Not completed</p>}
            </div>

            <div>
                <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Phase 2 (Quiz)</h4>
                {team.phase2?.completed ? (
                    <>
                        <p><strong>Score:</strong> {team.phase2.lastScore || team.phase2.scores?.slice(-1)[0] || 0}/10</p>
                        <p><strong>Attempts:</strong> {team.phase2.attempts}</p>
                    </>
                ) : <p style={{ color: '#666' }}>Not completed</p>}
            </div>

            <div>
                <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Phase 3 (Code)</h4>
                {team.phase3?.completed ? (
                    <p><strong>Score:</strong> {team.phase3.score}/5</p>
                ) : <p style={{ color: '#666' }}>Not completed</p>}
            </div>

            <div>
                <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Phase 4 (Debug)</h4>
                {team.phase4?.completed ? (
                    <>
                        <p><strong>Room Found:</strong> {team.phase4.roomNumber}</p>
                        <p><strong>Attempts:</strong> {team.phase4.attempts}</p>
                    </>
                ) : <p style={{ color: '#666' }}>Not completed</p>}
            </div>

            <div>
                <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Phase 5 (Riddles)</h4>
                {team.phase5?.completed ? (
                    <p><strong>Score:</strong> {team.phase5.score}/5</p>
                ) : <p style={{ color: '#666' }}>Not completed</p>}
            </div>

            <div>
                <h4 style={{ color: '#FFD700', marginBottom: '10px' }}>Phase 6 (Final)</h4>
                {team.phase6?.completed ? (
                    <>
                        <p><strong>Location:</strong> {team.phase6.locationAnswer}</p>
                        <p><strong>Photo:</strong> {team.phase6.photoPath ? 'Uploaded' : 'N/A'}</p>
                    </>
                ) : <p style={{ color: '#666' }}>Not completed</p>}
            </div>
        </div>
    )
}
