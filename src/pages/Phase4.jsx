import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bug, Check, AlertCircle, ArrowRight, Lightbulb, Key } from 'lucide-react'
import { API_URL } from '../App'

export default function Phase4({ team, setTeam }) {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [roomNumber, setRoomNumber] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [attempts, setAttempts] = useState(0)
    const [hint, setHint] = useState(null)

    // Fetch code - MUST be before any conditional returns (React hooks rule)
    useEffect(() => {
        const fetchCode = async () => {
            try {
                const res = await fetch(`${API_URL}/phase4/code`)
                const data = await res.json()
                if (data.code) {
                    setCode(data.code)
                    setLoading(false)
                } else {
                    console.error('Invalid code data:', data)
                    setLoading(false)
                }
            } catch (err) {
                console.error('Failed to load code')
                setLoading(false)
            }
        }
        fetchCode()
    }, [])

    // Redirect checks
    if (!team) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#FFD700', marginBottom: '20px' }} />
                <h2>Please Register First</h2>
                <button onClick={() => navigate('/phase1')} className="btn btn-primary">Go to Phase 1</button>
            </div>
        )
    }

    if (result?.success) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="success-icon"><Key size={60} /></div>
                <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Room 305 Unlocked!</h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                    You successfully debugged the code and found the room number!
                </p>
                <div style={{
                    display: 'inline-block',
                    padding: '30px 60px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '3px solid #FFD700',
                    borderRadius: '20px',
                    marginBottom: '40px'
                }}>
                    <p style={{ color: '#FFD700', fontFamily: 'Orbitron', fontSize: '0.9rem', marginBottom: '10px' }}>
                        YOUR DESTINATION
                    </p>
                    <h1 style={{ fontSize: '4rem', margin: 0 }}>305</h1>
                </div>
                <br />
                <button onClick={() => navigate('/phase5')} className="btn btn-primary btn-large">
                    Proceed to Phase 5 <ArrowRight size={20} />
                </button>
            </div>
        )
    }

    if (team.currentPhase > 4) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="success-icon"><Check size={60} /></div>
                <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Phase 4 Completed!</h2>
                <button onClick={() => navigate(`/phase${team.currentPhase}`)} className="btn btn-primary">
                    Continue to Phase {team.currentPhase}
                </button>
            </div>
        )
    }

    if (team.currentPhase < 4) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#FFD700', marginBottom: '20px' }} />
                <h2>Phase Locked</h2>
                <button onClick={() => navigate(`/phase${team.currentPhase}`)} className="btn btn-primary">
                    Go to Phase {team.currentPhase}
                </button>
            </div>
        )
    }

    const handleSubmit = async () => {
        if (!roomNumber.trim()) return

        setSubmitting(true)

        try {
            const res = await fetch(`${API_URL}/phase4/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: team.teamId, roomNumber })
            })
            const data = await res.json()

            if (!res.ok) {
                if (data.error === 'Not on Phase 4' || data.error?.includes('completed')) {
                    const teamRes = await fetch(`${API_URL}/teams/${team.teamName}`)
                    if (teamRes.ok) {
                        const teamData = await teamRes.json()
                        setTeam(teamData)
                        return
                    }
                }

                setResult({ success: false, message: data.error || 'Submission failed' })
                if (data.attempts) setAttempts(data.attempts)
                setSubmitting(false)
                return
            }

            if (data.correct) {
                setResult({ success: true, message: data.message })
                const teamRes = await fetch(`${API_URL}/teams/${team.teamName}`)
                const teamData = await teamRes.json()
                setTeam(teamData)
            } else {
                setResult({ success: false, message: data.message })
                setAttempts(data.attempts)
                if (data.hint) setHint(data.hint)
            }
        } catch (err) {
            setResult({ success: false, message: 'Failed to submit' })
        }

        setSubmitting(false)
    }

    const highlightCode = (codeStr) => {
        return codeStr
            .replace(/(#include|int|float|char|void|return|if|else|for|while|printf|main)/g, '<span class="code-keyword">$1</span>')
            .replace(/(".*?")/g, '<span class="code-string">$1</span>')
            .replace(/(\d+)/g, '<span class="code-number">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>')
    }

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner" />
                <p>Loading challenge...</p>
            </div>
        )
    }

    return (
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Bug size={50} style={{ color: '#FFD700', marginBottom: '15px' }} />
                <h1>Phase 4: Debug & Discover</h1>
                <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>
                    Fix the bugs to reveal the Room Number
                </p>
            </div>

            <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>
                    <Bug size={20} style={{ marginRight: '10px' }} />
                    Buggy C Program
                </h3>
                <p style={{ marginBottom: '20px' }}>
                    This code contains <strong style={{ color: '#FFD700' }}>3 bugs</strong>.
                    Find them, fix them mentally, and determine what room number the corrected code will print.
                </p>

                <div className="code-block" style={{ marginBottom: '0' }}>
                    <pre className="code-content" dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
                </div>
            </div>

            {/* Hint Box */}
            {hint && (
                <div className="hint-box">
                    <div className="hint-box-title">
                        <Lightbulb size={18} style={{ marginRight: '8px' }} />
                        Hint
                    </div>
                    <p className="hint-box-text">{hint}</p>
                </div>
            )}

            {/* Answer Input */}
            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>
                    <Key size={20} style={{ marginRight: '10px' }} />
                    Enter the Room Number
                </h3>

                {result && !result.success && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '20px'
                    }}>
                        <AlertCircle size={18} style={{ marginRight: '10px', color: '#ef4444' }} />
                        {result.message} (Attempt {attempts})
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Room Number</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter the room number"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                </div>

                <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Checking...' : 'Submit Room Number'}
                </button>
            </div>

            {/* Bug Types to Look For */}
            <div className="card" style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Common Bug Types</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: 2 }}>
                    <li>Syntax errors (missing punctuation)</li>
                    <li>Logic errors (wrong operators)</li>
                    <li>Semantic errors (incorrect comparisons)</li>
                </ul>
            </div>
        </div>
    )
}
