import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Check, AlertCircle, Image } from 'lucide-react'
import { API_URL } from '../App'

export default function Phase1({ team, setTeam }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        teamName: '',
        teamLeader: '',
        teamMembers: '',
        email: '',
        driveLink: '',
        aiPrompt: ''
    })

    // If already completed, redirect
    if (team && team.currentPhase > 1) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="success-icon">
                    <Check size={60} />
                </div>
                <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Phase 1 Completed!</h2>
                <p style={{ marginBottom: '30px' }}>You've already completed this phase.</p>
                <button onClick={() => navigate(`/phase${team.currentPhase}`)} className="btn btn-primary">
                    Continue to Phase {team.currentPhase}
                </button>
            </div>
        )
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required'
        if (!formData.teamLeader.trim()) newErrors.teamLeader = 'Team leader name is required'

        const members = formData.teamMembers.split(',').map(m => m.trim()).filter(m => m)
        if (members.length < 2 || members.length > 4) {
            newErrors.teamMembers = 'Must have 2-4 team members (comma-separated)'
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format'

        if (!formData.driveLink.includes('drive.google.com')) {
            newErrors.driveLink = 'Must be a valid Google Drive link'
        }

        if (!formData.aiPrompt.toUpperCase().includes('VU2050')) {
            newErrors.aiPrompt = 'Prompt must contain keyword "VU2050"'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/teams/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                setErrors({ submit: data.error })
                setLoading(false)
                return
            }

            // Fetch full team data
            const teamRes = await fetch(`${API_URL}/teams/${formData.teamName}`)
            const teamData = await teamRes.json()

            setTeam(teamData)
            setSuccess(true)

            setTimeout(() => {
                navigate('/phase2')
            }, 2000)
        } catch (err) {
            setErrors({ submit: 'Failed to connect to server. Make sure backend is running.' })
        }

        setLoading(false)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    if (success) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="success-icon">
                    <Check size={60} />
                </div>
                <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>Registration Successful!</h2>
                <p style={{ marginBottom: '30px' }}>Welcome to CodeHunt-2026, {formData.teamName}!</p>
                <p>Redirecting to Phase 2...</p>
            </div>
        )
    }

    return (
        <div className="container">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Sparkles size={50} style={{ color: '#FFD700', marginBottom: '15px' }} />
                    <h1>Phase 1: AI Image/Video Generation</h1>
                    <p style={{ fontSize: '1.1rem', marginTop: '15px' }}>
                        Create an AI-generated image or video showcasing
                    </p>
                    <h2 style={{ color: '#fff', marginTop: '10px' }}>"Vishwakarma University in 2050"</h2>
                </div>

                {/* Instructions */}
                <div className="card" style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '15px' }}>
                        <Image size={20} style={{ marginRight: '10px' }} />
                        Instructions
                    </h3>
                    <ul style={{ paddingLeft: '20px', lineHeight: 2 }}>
                        <li>Use any AI tool: Bing Image Creator, Canva AI, RunwayML, Midjourney, DALL-E, etc.</li>
                        <li>Theme: Imagine VU campus in the year 2050 - futuristic, innovative, tech-forward</li>
                        <li>Upload your creation to Google Drive and share the link</li>
                        <li>Your prompt MUST contain the keyword "VU2050"</li>
                    </ul>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="card">
                    <h3 style={{ marginBottom: '25px' }}>Team Registration & Submission</h3>

                    {errors.submit && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                            <AlertCircle size={18} style={{ marginRight: '10px', color: '#ef4444' }} />
                            {errors.submit}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Team Name *</label>
                        <input
                            type="text"
                            name="teamName"
                            className="form-input"
                            placeholder="Enter unique team name"
                            value={formData.teamName}
                            onChange={handleChange}
                        />
                        {errors.teamName && <p className="form-error">{errors.teamName}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Team Leader Name *</label>
                        <input
                            type="text"
                            name="teamLeader"
                            className="form-input"
                            placeholder="Enter team leader's full name"
                            value={formData.teamLeader}
                            onChange={handleChange}
                        />
                        {errors.teamLeader && <p className="form-error">{errors.teamLeader}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Team Members (2-4 members, comma-separated) *</label>
                        <input
                            type="text"
                            name="teamMembers"
                            className="form-input"
                            placeholder="e.g., John Doe, Jane Smith, Alex Johnson"
                            value={formData.teamMembers}
                            onChange={handleChange}
                        />
                        {errors.teamMembers && <p className="form-error">{errors.teamMembers}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email / Contact *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Google Drive Link for Image/Video *</label>
                        <input
                            type="url"
                            name="driveLink"
                            className="form-input"
                            placeholder="https://drive.google.com/..."
                            value={formData.driveLink}
                            onChange={handleChange}
                        />
                        {errors.driveLink && <p className="form-error">{errors.driveLink}</p>}
                        {formData.driveLink.includes('drive.google.com') &&
                            <p className="form-success">✓ Valid Google Drive link</p>
                        }
                    </div>

                    <div className="form-group">
                        <label className="form-label">AI Prompt Used (must contain "VU2050") *</label>
                        <textarea
                            name="aiPrompt"
                            className="form-textarea"
                            placeholder="Enter the exact prompt you used to generate your image/video..."
                            value={formData.aiPrompt}
                            onChange={handleChange}
                        />
                        {errors.aiPrompt && <p className="form-error">{errors.aiPrompt}</p>}
                        {formData.aiPrompt.toUpperCase().includes('VU2050') &&
                            <p className="form-success">✓ Contains VU2050 keyword</p>
                        }
                    </div>

                    <button type="submit" className="btn btn-primary btn-large" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
                        {loading ? 'Submitting...' : 'Submit & Proceed to Phase 2'}
                    </button>
                </form>
            </div>
        </div>
    )
}
