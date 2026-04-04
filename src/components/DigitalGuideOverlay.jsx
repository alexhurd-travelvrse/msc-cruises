import React from 'react';
import { useVoice } from '../context/VoiceContext';

const DigitalGuideOverlay = ({ avatarUrl, name, isVisible = true, positionStyle = { bottom: '30px', right: '30px' } }) => {
    const { volumeRef } = useVoice();
    
    // Using a ref and manual DOM update for volume pulse to avoid React re-renders for every audio frame
    const orbRef = React.useRef(null);
    const rotationRef = React.useRef({ x: 0, y: 0 });
    const pulsingRef = React.useRef(false);
    
    React.useEffect(() => {
        window.orbAlive = true;
        console.warn('[OrbHUD] ALIVE - Global Listeners Active');
        
        const handleLookAt = (e) => {
            const { x, y } = e.detail;
            console.log(`[OrbHUD] RECEIVED Look-At:`, { x, y });
            rotationRef.current = { x, y };
        };
        const handlePulse = () => {
            console.log(`[OrbHUD] RECEIVED Pulse`);
            pulsingRef.current = true;
            setTimeout(() => pulsingRef.current = false, 400);
        };

        window.addEventListener('orb-look-at', handleLookAt);
        window.addEventListener('orb-pulse', handlePulse);
        return () => {
            window.removeEventListener('orb-look-at', handleLookAt);
            window.removeEventListener('orb-pulse', handlePulse);
        };
    }, []);

    const currentRotationRef = React.useRef({ x: 0, y: 0 });

    React.useEffect(() => {
        if (!isVisible) return;

        let frameId;
        const update = () => {
            if (orbRef.current) {
                const v = volumeRef?.current || 0;
                const isPulsing = pulsingRef.current;
                const targetRot = rotationRef.current;
                
                // Smooth Lerp for rotation
                currentRotationRef.current.x += (targetRot.x - currentRotationRef.current.x) * 0.1;
                currentRotationRef.current.y += (targetRot.y - currentRotationRef.current.y) * 0.1;

                const scale = (1 + v * 0.2) * (isPulsing ? 1.05 : 1);
                const shadow = 10 + v * 40 + (isPulsing ? 40 : 0);
                
                // Enhanced Rotation Magnitude for clear visual feedback
                const rotateY = currentRotationRef.current.x * 1.5; 
                const rotateX = currentRotationRef.current.y * -1.5; // Invert X for natural look-at

                orbRef.current.style.transform = `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`;
                orbRef.current.style.boxShadow = `0 10px 40px rgba(0,0,0,0.5), 0 0 ${shadow}px rgba(0, 229, 255, ${0.3 + (v * 0.6) + (isPulsing ? 0.5 : 0)})`;
                orbRef.current.style.borderColor = `rgba(0, 229, 255, ${0.2 + (isPulsing ? 0.6 : 0)})`;
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
            zIndex: 9005, // High priority HUD layer
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            opacity: 1,
            ...positionStyle
        }}>
            {/* The Orb Container */}
            <div 
                ref={orbRef}
                style={{
                    width: 'clamp(90px, 16vh, 140px)',
                    height: 'clamp(90px, 16vh, 140px)',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.4))',
                    overflow: 'hidden',
                    position: 'relative',
                    backdropFilter: 'blur(30px) saturate(140%)',
                    willChange: 'transform, box-shadow, border-color',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)',
                    transition: 'border-color 0.4s ease',
                    pointerEvents: 'auto'
                }}
            >
                {/* Scanning Beam */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '10px',
                    background: 'linear-gradient(to bottom, transparent, rgba(0, 229, 255, 0.4), transparent)',
                    zIndex: 2,
                    animation: 'scanline 4s linear infinite',
                    pointerEvents: 'none'
                }} />

                <img 
                    src={avatarUrl} 
                    alt={name} 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        opacity: 0.9,
                        filter: 'grayscale(0.3) contrast(1.2) brightness(1.1)',
                        transform: 'scale(1.1)',
                        transition: 'filter 0.3s ease'
                    }} 
                />
                
                {/* Gloss/Refraction Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 3
                }} />

                {/* Internal Hardware Border */}
                <div style={{
                    position: 'absolute',
                    inset: '4px',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 4
                }} />
            </div>

            {/* Name Badge - Luxury Metadata Label */}
            <div className="metadata-label" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '0.5px solid rgba(255, 255, 255, 0.2)',
                padding: '4px 16px',
                borderRadius: '2px', // Leica Hard Edge
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: '400',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginTop: '12px',
                whiteSpace: 'nowrap'
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
