import React from 'react';
import { useVoice } from '../context/VoiceContext';

const DigitalGuideOverlay = ({ avatarUrl, name, isVisible = true, positionStyle = { bottom: '30px', right: '30px' } }) => {
    const { volumeRef } = useVoice();
    
    // Using a ref and manual DOM update for volume pulse to avoid React re-renders for every audio frame
    const orbRef = React.useRef(null);
    
    React.useEffect(() => {
        if (!isVisible) return;

        let frameId;
        const update = () => {
            if (orbRef.current) {
                const v = volumeRef?.current || 0;
                const scale = 1 + v * 0.25;
                const shadow = 15 + v * 30;
                orbRef.current.style.transform = `scale(${scale})`;
                orbRef.current.style.boxShadow = `0 0 ${shadow}px rgba(0, 229, 255, 0.6), inset 0 0 15px rgba(0, 229, 255, 0.2)`;
            }
            frameId = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(frameId);
    }, [volumeRef, isVisible]);

    if (!isVisible) return null;

    return (
        <div className="digital-guide-overlay" style={{
            position: 'fixed',
            zIndex: 50, // Layer 2: The Orb/Influencer
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'min(1vh, 10px)',
            opacity: 1,
            ...positionStyle
        }}>
            {/* The Orb */}
            <div 
                ref={orbRef}
                style={{
                    width: 'clamp(60px, 12vh, 110px)',
                    height: 'clamp(60px, 12vh, 110px)',
                    borderRadius: '50%',
                    border: '2px solid var(--color-accent-primary)',
                    background: 'rgba(5, 11, 20, 0.8)',
                    overflow: 'hidden',
                    position: 'relative',
                    backdropFilter: 'blur(8px)',
                    willChange: 'transform, box-shadow'
                }}
            >
                <img 
                    src={avatarUrl} 
                    alt={name} 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        opacity: 0.9,
                        filter: 'contrast(1.1) brightness(1.1)'
                    }} 
                />
                
                {/* Glass Highlight */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '20%',
                    width: '30%',
                    height: '20%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 80%)',
                    borderRadius: '50%',
                }} />
                
                {/* scanning line effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'rgba(0, 229, 255, 0.4)',
                    boxShadow: '0 0 8px #00e5ff',
                    animation: 'scanline 4s linear infinite',
                }} />
            </div>
            {/* Name Badge */}
            <div style={{
                background: 'rgba(0, 229, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #ffffff',
                padding: 'clamp(2px, 0.5vh, 6px) clamp(8px, 2vw, 20px)',
                borderRadius: '20px',
                color: '#000000',
                fontSize: 'clamp(0.5rem, 0.9vh, 0.8rem)',
                fontWeight: '900',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)',
                whiteSpace: 'nowrap',
                marginTop: 'min(0.5vh, 4px)'
            }}>
                {name}
            </div>


            <style>{`
                @keyframes scanline {
                    0% { transform: translateY(-10px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(110px); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default DigitalGuideOverlay;
