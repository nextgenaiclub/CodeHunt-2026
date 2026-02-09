import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Clock, Check, X, AlertCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { API_URL } from '../App'

export default function Phase2({ team, setTeam }) {
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState({})
    const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
    const [loading, setLoading] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState('')

    // All hooks MUST be before any conditional returns (React hooks rule)
    // Fetch questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`${API_URL}/phase2/questions`)
                const data = await res.json()
                if (Array.isArray(data)) {
                    setQuestions(data)
                    setLoading(false)
                } else {
                    console.error('Invalid questions data:', data)
                    setLoading(false)
                }
            } catch (err) {
                console.error('Failed to load questions')
                setLoading(false)
            }
        }
        fetchQuestions()
    }, [])

    // Timer - defined as useCallback to avoid recreating on every render
    const handleSubmit = useCallback(async () => {
        if (submitted) return
        setSubmitted(true)

        try {
            const res = await fetch(`${API_URL}/phase2/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: team?.teamId,
                    answers
                })
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Submission failed')
                setSubmitted(false)
                return
            }

            setResults(data)
            if (data.passed) {
                const teamRes = await fetch(`${API_URL}/teams/${team.teamName}`)
                const teamData = await teamRes.json()
                setTeam(teamData)
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('Failed to submit answers')
            setSubmitted(false)
        }
    }, [submitted, answers, team, setTeam])

    // Timer effect
    useEffect(() => {
        if (submitted || loading) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [submitted, loading, handleSubmit])

    // Redirect checks
    if (!team) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#FFD700', marginBottom: '20px' }} />
                <h2>Please Register First</h2>
                <p style={{ marginBottom: '30px' }}>You need to complete Phase 1 before accessing this phase.</p>
                <button onClick={() => navigate('/phase1')} className="btn btn-primary">Go to Phase 1</button>
            </div>
        )
    }

    // Only redirect if we don't have active results to show
    if (!results && team.currentPhase > 2) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="success-icon"><Check size={60} /></div>
                <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Phase 2 Completed!</h2>
                <button onClick={() => navigate(`/phase${team.currentPhase}`)} className="btn btn-primary">
                    Continue to Phase {team.currentPhase}
                </button>
            </div>
        )
    }

    if (!results && team.currentPhase < 2) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#FFD700', marginBottom: '20px' }} />
                <h2>Phase Locked</h2>
                <p style={{ marginBottom: '30px' }}>Complete Phase {team.currentPhase} first.</p>
                <button onClick={() => navigate(`/phase${team.currentPhase}`)} className="btn btn-primary">
                    Go to Phase {team.currentPhase}
                </button>
            </div>
        )
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Error state
    if (error && !results) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#ef4444', marginBottom: '20px' }} />
                <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>Error</h2>
                <p style={{ marginBottom: '30px' }}>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        )
    }

    if (loading && !results) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner" />
                <p>{submitted ? 'Submitting answers...' : 'Loading questions...'}</p>
            </div>
        )
    }

    if (!loading && !results && questions.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={60} style={{ color: '#ef4444', marginBottom: '20px' }} />
                <h2>No Questions Available</h2>
                <p>Unable to load questions. Please refresh or contact support.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">Refresh Page</button>
                    <button onClick={() => { setError(''); setSubmitted(false); }} className="btn btn-secondary">Try Again</button>
                </div>
            </div>
        )
    }

    if (results) {
        return (
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="score-circle" style={{ '--score': results.score || 0 }}>
                        <span className="score-number">{results.score || 0}/10</span>
                    </div>

                    {results.passed ? (
                        <>
                            <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Congratulations! You Passed!</h2>
                            <p style={{ marginBottom: '30px' }}>You scored {results.score}/10 (minimum 6 required)</p>
                        </>
                    ) : (
                        <>
                            <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>Not Quite!</h2>
                            <p style={{ marginBottom: '20px' }}>You scored {results.score}/10 (need 6 to pass)</p>
                            {results.canRetry ? (
                                <p style={{ color: '#FFD700' }}>You have 1 retry remaining!</p>
                            ) : (
                                <p style={{ color: '#ef4444' }}>No retries remaining. Contact organizers.</p>
                            )}
                        </>
                    )}
                </div>

                {results.questions && results.results && (
                    <>
                        <h3 style={{ marginBottom: '20px' }}>Review Answers</h3>
                        {results.questions.map((q, i) => (
                            <div key={q.id} className="quiz-question" style={{
                                borderColor: results.results[i]?.isCorrect ? '#22c55e' : '#ef4444'
                            }}>
                                <div className="quiz-question-number">Question {i + 1}</div>
                                <p className="quiz-question-text">{q.question}</p>
                                <div className="quiz-options">
                                    {q.options.map((opt, j) => (
                                        <div key={j} className={`quiz-option ${j === q.correctAnswer ? 'correct' :
                                            j === results.results[i]?.userAnswer && !results.results[i]?.isCorrect ? 'incorrect' : ''
                                            }`}>
                                            <span className="quiz-radio" />
                                            <span className="quiz-option-text">{opt}</span>
                                            {j === q.correctAnswer && <Check size={20} style={{ marginLeft: 'auto', color: '#22c55e' }} />}
                                            {j === results.results[i]?.userAnswer && !results.results[i]?.isCorrect &&
                                                <X size={20} style={{ marginLeft: 'auto', color: '#ef4444' }} />
                                            }
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    {results.passed ? (
                        <button onClick={() => navigate('/phase3')} className="btn btn-primary btn-large">
                            Proceed to Phase 3 <ArrowRight size={20} />
                        </button>
                    ) : results.canRetry ? (
                        <button onClick={() => window.location.reload()} className="btn btn-primary btn-large">
                            <RotateCcw size={20} /> Retry Quiz
                        </button>
                    ) : null}
                </div>
            </div>
        )
    }

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Target size={50} style={{ color: '#FFD700', marginBottom: '15px' }} />
                <h1>Phase 2: AI Fundamentals Quiz</h1>
                <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>Test Your AI Knowledge - 10 Questions</p>
            </div>

            {/* Timer & Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div className={`timer ${timeLeft < 120 ? 'warning' : ''}`}>
                    <Clock size={24} style={{ marginRight: '10px' }} />
                    {formatTime(timeLeft)}
                </div>
                <div style={{ fontFamily: 'Orbitron', color: '#FFD700' }}>
                    Question {currentQ + 1} / {questions.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>

            {/* Question Card */}
            {questions[currentQ] && (
                <div className="quiz-question">
                    <div className="quiz-question-number">Question {currentQ + 1}</div>
                    <p className="quiz-question-text">{questions[currentQ].question}</p>
                    <div className="quiz-options">
                        {questions[currentQ].options.map((opt, i) => (
                            <div
                                key={i}
                                className={`quiz-option ${answers[currentQ] === i ? 'selected' : ''}`}
                                onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: i }))}
                            >
                                <span className="quiz-radio" />
                                <span className="quiz-option-text">{opt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <button
                    onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                    className="btn btn-secondary"
                    disabled={currentQ === 0}
                >
                    <ArrowLeft size={20} /> Previous
                </button>

                {currentQ < questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(prev => prev + 1)} className="btn btn-primary">
                        Next <ArrowRight size={20} />
                    </button>
                ) : (
                    <button onClick={handleSubmit} className="btn btn-primary">
                        Submit Quiz <Check size={20} />
                    </button>
                )}
            </div>

            {/* Question Indicators */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px' }}>
                {questions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentQ(i)}
                        style={{
                            width: '40px', height: '40px', borderRadius: '8px', border: 'none',
                            background: answers[i] !== undefined ? '#FFD700' : '#2a2a2a',
                            color: answers[i] !== undefined ? '#000' : '#fff',
                            fontWeight: 'bold', cursor: 'pointer',
                            outline: i === currentQ ? '2px solid #FFD700' : 'none',
                            outlineOffset: '2px'
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    )
}
