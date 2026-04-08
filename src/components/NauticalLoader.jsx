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
            background: '#050510',
            zIndex: 99999,
            fontFamily: 'Outfit, sans-serif',
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
                {/* Nautical Helm Spinner - Modernized */}
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                    <svg viewBox="0 0 100 100" style={{
                        width: '100%',
                        height: '100%',
                        animation: 'nautical-spin 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                        filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.3))'
                    }}>
                        <style>
                            {`@keyframes nautical-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
                        </style>
                        {/* Wheel Outer Ring */}
                        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" strokeDasharray="5,10" />
                        
                        {/* Spokes */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                            <line 
                                key={deg} 
                                x1="50" y1="20" x2="50" y2="35" 
                                stroke="#00e5ff" 
                                strokeWidth="1" 
                                transform={`rotate(${deg} 50 50)`} 
                            />
                        ))}
                        {/* Central Hub */}
                        <circle cx="50" cy="50" r="4" fill="none" stroke="#00e5ff" strokeWidth="1" />
                    </svg>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 300, 
                        letterSpacing: '0.4em', 
                        color: 'rgba(255,255,255,0.4)', 
                        textTransform: 'uppercase',
                        margin: '0 0 12px 0'
                    }}>
                        Initializing Reality
                    </div>
                    <div className="serif-title" style={{ 
                        fontSize: '1.8rem', 
                        color: '#fff',
                        letterSpacing: '0.05em'
                    }}>
                        MSC World Europa
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

export default NauticalLoader;
