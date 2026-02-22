import { useState } from 'react'
import { MapPin, Eye, EyeOff } from 'lucide-react'

export default function Phase5Location2() {
    const [revealed, setRevealed] = useState(false)

    return (
        <div
            className="container"
            style={{
                maxWidth: '680px',
                margin: '0 auto',
                padding: '60px 20px',
                textAlign: 'center'
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <MapPin
                    size={54}
                    style={{
                        color: '#FFD700',
                        marginBottom: '18px',
                        filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.5))'
                    }}
                />
                <h1
                    style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '1.6rem',
                        letterSpacing: '2px',
                        color: '#FFD700',
                        marginBottom: '8px'
                    }}
                >
                    Location Found
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                    You've discovered a hidden location. Read the riddle carefully.
                </p>
            </div>

            {/* Riddle Card */}
            <div
                style={{
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '2px solid rgba(139, 92, 246, 0.35)',
                    borderRadius: '20px',
                    padding: '40px 36px',
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.15)'
                }}
            >
                {/* Decorative blurred orb */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '-40px',
                        width: '160px',
                        height: '160px',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }}
                />

                <p
                    style={{
                        color: '#a78bfa',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.8rem',
                        letterSpacing: '2px',
                        marginBottom: '28px',
                        textAlign: 'center'
                    }}
                >
                    🧩 FINAL RIDDLE
                </p>

                {/* English Poem */}
                <p
                    style={{
                        lineHeight: '2',
                        fontSize: '1.08rem',
                        color: '#e2e8f0',
                        fontStyle: 'italic',
                        marginBottom: '28px'
                    }}
                >
                    I am the mind behind your mission,<br />
                    {' '}&nbsp;&nbsp;Not a person, yet I lead.<br />
                    I <u style={{ textDecorationThickness: '2px' }}>stand tall</u>, I wear the{' '}
                    <u style={{ textDecorationThickness: '2px' }}>organizing team's mark</u>,<br />
                    {' '}&nbsp;&nbsp;Where ideas meet their seed.
                    <br />
                    <br />
                    Find me where the{' '}
                    <u style={{ textDecorationThickness: '2px' }}>second rise</u> begins,<br />
                    {' '}&nbsp;&nbsp;On the{' '}
                    <u style={{ textDecorationThickness: '2px' }}>floor that touches ground</u>.<br />
                    {' '}&nbsp;&nbsp;Capture proof that you were here —<br />
                    {' '}&nbsp;&nbsp;And your victory is found.
                </p>

                {/* Divider */}
                <div
                    style={{
                        height: '1px',
                        background: 'rgba(139,92,246,0.3)',
                        margin: '0 0 24px 0'
                    }}
                />

                {/* Reveal button for Hinglish */}
                {!revealed ? (
                    <button
                        onClick={() => setRevealed(true)}
                        style={{
                            background: 'rgba(139,92,246,0.15)',
                            border: '1px solid rgba(139,92,246,0.4)',
                            borderRadius: '10px',
                            color: '#a78bfa',
                            padding: '10px 24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(139,92,246,0.25)'
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(139,92,246,0.15)'
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
                        }}
                    >
                        <Eye size={16} /> Show Hinglish Version
                    </button>
                ) : (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '14px'
                            }}
                        >
                            <span
                                style={{
                                    color: '#a78bfa',
                                    fontFamily: 'Orbitron, sans-serif',
                                    fontSize: '0.75rem',
                                    letterSpacing: '1.5px'
                                }}
                            >
                                HINGLISH VERSION
                            </span>
                            <button
                                onClick={() => setRevealed(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.8rem',
                                    padding: '4px 8px'
                                }}
                            >
                                <EyeOff size={13} /> Hide
                            </button>
                        </div>
                        <p
                            style={{
                                lineHeight: '2',
                                fontSize: '1rem',
                                color: '#cbd5e1',
                                fontStyle: 'italic',
                                margin: 0
                            }}
                        >
                            Main hoon woh soch jo mission chalati hai,<br />
                            {' '}&nbsp;&nbsp;Insan nahi, par team ko chalati hai.<br />
                            Main <u style={{ textDecorationThickness: '2px' }}>khadi hoon</u>, pehne hain{' '}
                            <u style={{ textDecorationThickness: '2px' }}>organizing team ke nishaan</u>,<br />
                            {' '}&nbsp;&nbsp;Jahan ideas banate hain apna makaan.
                            <br />
                            <br />
                            Dhundho mujhe jahan{' '}
                            <u style={{ textDecorationThickness: '2px' }}>doosri chadhai</u> shuru ho,<br />
                            {' '}&nbsp;&nbsp;
                            <u style={{ textDecorationThickness: '2px' }}>Zameen se chhune wali manzil</u> pe aao.<br />
                            {' '}&nbsp;&nbsp;Apni maujooodgi ka saboot pakdo —<br />
                            {' '}&nbsp;&nbsp;Aur jeet tumhari jholi mein aao.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer note */}
            <p
                style={{
                    marginTop: '32px',
                    color: '#FFD700',
                    fontSize: '1rem',
                    letterSpacing: '0.5px'
                }}
            >
                Solve the riddle, find the location, and capture proof to proceed!
            </p>
        </div>
    )
}
