import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Check, X, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { API_URL } from '../App'

export default function Phase5({ team, setTeam }) {
    const navigate = useNavigate()
    const [riddles, setRiddles] = useState([])
    const [currentRiddle, setCurrentRiddle] = useState(0)
    const [answers, setAnswers] = useState({})
    const [correctCount, setCorrectCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [checkingAnswer, setCheckingAnswer] = useState(false)
    const [answerResult, setAnswerResult] = useState(null)
    const [textAnswer, setTextAnswer] = useState('')
    const [completed, setCompleted] = useState(false)

    // Fetch riddles - MUST be before any conditional returns (React hooks rule)
    useEffect(() => {
        const fetchRiddles = async () => {
            try {
                const res = await fetch(`${API_URL}/phase5/riddles`)
                const data = await res.json()
                if (Array.isArray(data)) {
                    setRiddles(data)
                } else {
                    console.error('Invalid riddles data:', data)
                }
                setLoading(false)
            } catch (err) {
                console.error('Failed to load riddles')
                setLoading(false)
            }
        }
        fetchRiddles()
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

    if (completed) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                {correctCount >= 4 ? (
                    <>
                        <div className="success-icon"><Sparkles size={60} /></div>
                        <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Brilliant! All Riddles Solved!</h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                            You got {correctCount}/5 correct!
                        </p>
                        <p style={{ marginBottom: '40px' }}>You've proven your logical prowess.</p>
                        <button onClick={() => navigate('/phase6')} className="btn btn-primary btn-large">
                            Proceed to Final Phase <ArrowRight size={20} />
                        </button>
                    </>
                ) : (
                    <>
                        <AlertCircle size={60} style={{ color: '#ef4444', marginBottom: '20px' }} />
                        <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>Not Enough Correct Answers</h2>
                        <p style={{ marginBottom: '30px' }}>
                            You got {correctCount}/5 correct. You need at least 4/5 to proceed.
                        </p>
                        <p>Contact organizers for assistance.</p>
                    </>
                )}
            </div>
        )
    }

    if (team.currentPhase > 5) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="success-icon"><Check size={60} /></div>
                <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Phase 5 Completed!</h2>
                <button onClick={() => navigate(`/phase${team.currentPhase}`)} className="btn btn-primary">
                    Continue to Phase {team.currentPhase}
                </button>
            </div>
        )
    }

    if (team.currentPhase < 5) {
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

    const checkAnswer = async (answer) => {
        setCheckingAnswer(true)

        try {
            const res = await fetch(`${API_URL}/phase5/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: team.teamId,
                    riddleId: riddles[currentRiddle].id,
                    answer
                })
            })
            const data = await res.json()

            setAnswerResult(data.correct)
            setAnswers(prev => ({ ...prev, [currentRiddle]: { answer, correct: data.correct } }))

            if (data.correct) {
                setCorrectCount(prev => prev + 1)
            }
        } catch (err) {
            console.error('Failed to check answer')
        }

        setCheckingAnswer(false)
    }

    const handleMCQAnswer = (optionIndex) => {
        if (answers[currentRiddle]) return
        checkAnswer(optionIndex)
    }

    const handleTextAnswer = () => {
        if (!textAnswer.trim() || answers[currentRiddle]) return
        checkAnswer(textAnswer)
        setTextAnswer('')
    }

    const handleNextRiddle = async () => {
        if (currentRiddle < riddles.length - 1) {
            setCurrentRiddle(prev => prev + 1)
            setAnswerResult(null)
        } else {
            // Complete phase
            if (correctCount >= 4) {
                try {
                    const answersArray = Object.values(answers).map(a => a.answer)
                    await fetch(`${API_URL}/phase5/complete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            teamId: team.teamId,
                            answers: answersArray,
                            score: correctCount
                        })
                    })

                    const teamRes = await fetch(`${API_URL}/teams/${team.teamName}`)
                    const teamData = await teamRes.json()
                    setTeam(teamData)
                    setCompleted(true)
                } catch (err) {
                    console.error('Failed to complete phase')
                }
            } else {
                setCompleted(true)
            }
        }
    }

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner" />
                <p>Loading riddles...</p>
            </div>
        )
    }

    if (!completed && riddles.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#ef4444', marginBottom: '20px' }} />
                <h2>No Riddles Available</h2>
                <p>Unable to load riddles. Please refresh or contact support.</p>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">Refresh Page</button>
                    <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginLeft: '10px' }}>Go Home</button>
                </div>
            </div>
        )
    }

    if (completed) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                {correctCount >= 4 ? (
                    <>
                        <div className="success-icon"><Sparkles size={60} /></div>
                        <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Brilliant! All Riddles Solved!</h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                            You got {correctCount}/5 correct!
                        </p>
                        <p style={{ marginBottom: '40px' }}>You've proven your logical prowess.</p>
                        <button onClick={() => navigate('/phase6')} className="btn btn-primary btn-large">
                            Proceed to Final Phase <ArrowRight size={20} />
                        </button>
                    </>
                ) : (
                    <>
                        <AlertCircle size={60} style={{ color: '#ef4444', marginBottom: '20px' }} />
                        <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>Not Enough Correct Answers</h2>
                        <p style={{ marginBottom: '30px' }}>
                            You got {correctCount}/5 correct. You need at least 4/5 to proceed.
                        </p>
                        <p>Contact organizers for assistance.</p>
                    </>
                )}
            </div>
        )
    }

    const riddle = riddles[currentRiddle]

    if (!riddle && !loading && !completed) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#ef4444', marginBottom: '20px' }} />
                <h2>Riddle Load Error</h2>
                <p>Unable to load riddle info. Please refresh.</p>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">Refresh Page</button>
                </div>
            </div>
        )
    }

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Brain size={50} style={{ color: '#FFD700', marginBottom: '15px' }} />
                <h1>Phase 5: Logic Riddles</h1>
                <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>Solve the puzzles to advance</p>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ fontFamily: 'Orbitron', color: '#FFD700' }}>
                    Riddle {currentRiddle + 1} / {riddles.length}
                </div>
                <div style={{ fontFamily: 'Orbitron', color: '#22c55e' }}>
                    {correctCount} Correct
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${((currentRiddle + 1) / riddles.length) * 100}%` }} />
            </div>

            {/* Riddle Card */}
            <div className="riddle-card">
                <div className="riddle-icon">🧩</div>
                <p className="riddle-text">"{riddle.riddle}"</p>

                {riddle.type === 'mcq' ? (
                    <div className="quiz-options">
                        {riddle.options.map((opt, i) => (
                            <div
                                key={i}
                                className={`quiz-option ${answers[currentRiddle]?.answer === i
                                    ? answers[currentRiddle]?.correct ? 'correct' : 'incorrect'
                                    : ''
                                    }`}
                                onClick={() => handleMCQAnswer(i)}
                                style={{ cursor: answers[currentRiddle] ? 'default' : 'pointer' }}
                            >
                                <span className="quiz-radio" />
                                <span className="quiz-option-text">{opt}</span>
                                {answers[currentRiddle]?.answer === i && answers[currentRiddle]?.correct &&
                                    <Check size={20} style={{ marginLeft: 'auto', color: '#22c55e' }} />
                                }
                                {answers[currentRiddle]?.answer === i && !answers[currentRiddle]?.correct &&
                                    <X size={20} style={{ marginLeft: 'auto', color: '#ef4444' }} />
                                }
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                        {!answers[currentRiddle] ? (
                            <>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Type your answer..."
                                    value={textAnswer}
                                    onChange={(e) => setTextAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleTextAnswer()}
                                    style={{ marginBottom: '15px' }}
                                />
                                <button
                                    onClick={handleTextAnswer}
                                    className="btn btn-primary"
                                    disabled={checkingAnswer || !textAnswer.trim()}
                                    style={{ width: '100%' }}
                                >
                                    {checkingAnswer ? 'Checking...' : 'Submit Answer'}
                                </button>
                            </>
                        ) : (
                            <div style={{
                                padding: '20px',
                                borderRadius: '12px',
                                background: answers[currentRiddle]?.correct ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `2px solid ${answers[currentRiddle]?.correct ? '#22c55e' : '#ef4444'}`
                            }}>
                                {answers[currentRiddle]?.correct ? (
                                    <><Check size={24} style={{ color: '#22c55e' }} /> Correct!</>
                                ) : (
                                    <><X size={24} style={{ color: '#ef4444' }} /> Incorrect</>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Result & Next */}
            {answers[currentRiddle] && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button onClick={handleNextRiddle} className="btn btn-primary btn-large">
                        {currentRiddle < riddles.length - 1 ? 'Next Riddle' : 'Complete Phase'} <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {/* Riddle Indicators */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '40px' }}>
                {riddles.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: '15px', height: '15px', borderRadius: '50%',
                            background: answers[i]?.correct ? '#22c55e' : answers[i] ? '#ef4444' : i === currentRiddle ? '#FFD700' : '#2a2a2a',
                            border: i === currentRiddle ? '2px solid #FFD700' : 'none',
                            boxShadow: i === currentRiddle ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
