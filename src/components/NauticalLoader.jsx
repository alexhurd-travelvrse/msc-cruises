import React from 'react';

const NauticalLoader = ({ progress, isSplatLoaded, isVisible }) => {
    if (!isVisible) return null;

    // Use isSplatLoaded to determine if we are in the "GPU Warmup" phase
    const displayProgress = isSplatLoaded ? 100 : progress;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle, #FDF5E6 0%, #EBF5FB 100%)',
            zIndex: 99999,
            fontFamily: 'Outfit, sans-serif',
            pointerEvents: 'all'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                padding: '40px',
                borderRadius: '30px',
                boxShadow: '0 20px 50px rgba(91, 192, 222, 0.2)',
                border: '2px solid rgba(91, 192, 222, 0.3)',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                width: '320px',
                textAlign: 'center'
            }}>
                {/* Nautical Helm Spinner */}
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg viewBox="0 0 100 100" style={{
                        width: '100%',
                        height: '100%',
                        animation: 'nautical-spin 6s linear infinite',
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    }}>
                        <style>
                            {`@keyframes nautical-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                        </style>
                        {/* Wheel Outer Ring */}
                        <circle cx="50" cy="50" r="32" fill="none" stroke="#3D8A9C" strokeWidth="3" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="#3D8A9C" strokeWidth="2" />
                        {/* Spokes with handles */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                            <g key={deg} transform={`rotate(${deg} 50 50)`}>
                                <rect x="48.5" y="5" width="3" height="30" fill="#3D8A9C" />
                                <circle cx="50" cy="6" r="4" fill="#5BC0DE" />
                            </g>
                        ))}
                        {/* Central Hub */}
                        <circle cx="50" cy="50" r="6" fill="white" stroke="#3D8A9C" strokeWidth="2" />
                    </svg>
                    {/* Centered Percentage */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        color: '#3D8A9C',
                        textShadow: '0 0 5px rgba(255,255,255,0.8)'
                    }}>
                        {displayProgress.toFixed(0)}%
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        letterSpacing: '5px', 
                        color: '#5D6D7E', 
                        textTransform: 'uppercase',
                        margin: '10px 0 5px 0'
                    }}>
                        Navigating
                    </div>
                    <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 400, 
                        color: '#3D8A9C',
                        fontFamily: 'Lobster, cursive'
                    }}>
                        Charting the course...
                    </div>
                </div>

                {/* Subtle progress bar at bottom */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', marginTop: '10px', overflow: 'hidden', borderRadius: '4px' }}>
                    <div style={{ 
                        width: `${displayProgress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #5BC0DE, #3D8A9C)', 
                        transition: 'width 0.4s ease-out' 
                    }} />
                </div>
            </div>
        </div>
    );
};

export default NauticalLoader;
