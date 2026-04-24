import React from 'react';

const ExperienceLoader = ({ progress, isSplatLoaded, isVisible }) => {
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
            background: '#050510',
            zIndex: 99999,
            fontFamily: 'Montserrat, sans-serif',
            pointerEvents: 'all'
        }}>
            {/* Background Glows */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(0, 229, 255, 0.05) 0%, transparent 70%)',
                zIndex: -1
            }} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '30px',
                padding: '60px',
                borderRadius: '2px', // Leica Hard Edge
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(40px)',
                width: '400px',
                textAlign: 'center',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
            }}>
                {/* Modern Abstract Spinner */}
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                    <svg viewBox="0 0 100 100" style={{
                        width: '100%',
                        height: '100%',
                        animation: 'spin-pulse 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                        filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.3))'
                    }}>
                        <style>
                            {`@keyframes spin-pulse { from { transform: rotate(0deg) scale(0.95); } 50% { transform: rotate(180deg) scale(1.05); } to { transform: rotate(360deg) scale(0.95); } }`}
                        </style>
                        {/* Outer Geometric Ring */}
                        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="10,200" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="4" />
                        
                        {/* Central HUD Element */}
                        <circle cx="50" cy="50" r="4" fill="#00e5ff" />
                        <circle cx="50" cy="50" r="8" fill="none" stroke="#00e5ff" strokeWidth="0.5" opacity="0.5" />
                    </svg>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div className="metadata-label" style={{ 
                        fontSize: '0.65rem', 
                        color: 'var(--color-accent-primary)',
                        marginBottom: '12px'
                    }}>
                        Initializing Reality
                    </div>
                    <div className="serif-title" style={{ 
                        fontSize: '1.8rem', 
                        color: '#fff',
                        letterSpacing: '0.05em'
                    }}>
                        {window.location.pathname.includes('25-hours') || localStorage.getItem('activeWhitelabelId_v1')?.includes('25-hours') ? '25 HOURS HOTEL' : 'VIRTUAL EXPERIENCE'}
                    </div>
                </div>

                {/* Progress Indicator */}
                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                    <div style={{ 
                        position: 'absolute', 
                        left: 0, 
                        top: 0, 
                        height: '100%', 
                        width: `${displayProgress}%`, 
                        background: '#00e5ff',
                        boxShadow: '0 0 15px #00e5ff',
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                {/* NAVIGATION GUIDE - ENHANCED VISUALS */}
                <div style={{
                    marginTop: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    width: '100%',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div className="metadata-label" style={{ fontSize: '0.6rem', color: '#00e5ff', opacity: 0.8 }}>TRANSLATE</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{ border: '1px solid #fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>W</div>
                                <div style={{ border: '1px solid #fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>A</div>
                                <div style={{ border: '1px solid #fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>S</div>
                                <div style={{ border: '1px solid #fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>D</div>
                            </div>
                        </div>
                        <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div className="metadata-label" style={{ fontSize: '0.6rem', color: '#00e5ff', opacity: 0.8 }}>ELEVATE</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{ border: '1px solid #fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>Q</div>
                                <div style={{ border: '1px solid #fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}>E</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '1.8rem' }}>🖱️</div>
                        <div style={{ textAlign: 'left' }}>
                            <div className="metadata-label" style={{ fontSize: '0.6rem', color: '#00e5ff', opacity: 0.8 }}>PANORAMIC LOOK</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em', fontWeight: 600 }}>CLICK + DRAG TO EXPLORE</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceLoader;
