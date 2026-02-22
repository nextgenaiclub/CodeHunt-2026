import { MapPin } from 'lucide-react'

export default function Phase5Location2() {
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
                        margin: 0
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
