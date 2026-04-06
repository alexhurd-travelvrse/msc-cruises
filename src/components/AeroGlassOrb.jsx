import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export const AeroGlassOrb = ({ onClick, avatarUrl }) => {
    const orbRef = useRef(null);
    const [isMobile] = useState(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const [showHint, setShowHint] = useState(true);
    
    const [{ pos }, api] = useSpring(() => ({
        pos: [80, window.innerHeight / 2],
        config: { tension: 120, friction: 14 }
    }));
    
    const [pulseProps, pulseApi] = useSpring(() => ({
        scale: 1,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
    }));

    const [{ tetherLength, tetherAngle }, tetherApi] = useSpring(() => ({
        tetherLength: 0,
        tetherAngle: 0,
        config: { mass: 1, tension: 200, friction: 20 }
    }));

    const interactState = useRef({ isScanning: false, pointerDown: false });

    useEffect(() => {
        const handleUpdate = (e) => {
            const { tether } = e.detail;
            
            if (tether) {
                tetherApi.start({ tetherLength: tether.length, tetherAngle: tether.angle });
            } else {
                tetherApi.start({ tetherLength: 0 });
            }
        };

        const handleScanStart = (e) => {
            interactState.current.isScanning = true;
            pulseApi.start({
                scale: 1.15,
                boxShadow: '0 0 40px rgba(0, 229, 255, 0.8), inset 0 0 20px rgba(0, 229, 255, 0.5)',
                borderColor: 'rgba(0, 229, 255, 0.9)'
            });
            // AI flies to the target coordinates
            if (e.detail && e.detail.x !== undefined && e.detail.y !== undefined) {
                api.start({ pos: [e.detail.x, e.detail.y] });
            }
        };

        const handleScanEnd = () => {
            interactState.current.isScanning = false;
            pulseApi.start({
                scale: 1,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
            });
            // Returns to resting dock on left side
            api.start({ pos: [80, window.innerHeight / 2] });
        };

        const handleSelect = () => {
            // Quick pulse for click
            pulseApi.start({ scale: 0.9, config: { duration: 100 } });
            setTimeout(() => {
                pulseApi.start({ scale: 1 });
            }, 100);
            if(onClick) onClick();
        };

        window.addEventListener('orb-scan-start', handleScanStart);
        window.addEventListener('orb-scan-end', handleScanEnd);
        window.addEventListener('orb-select', handleSelect);

        const hintTimer = setTimeout(() => setShowHint(false), 7000);

        return () => {
            window.removeEventListener('orb-scan-start', handleScanStart);
            window.removeEventListener('orb-scan-end', handleScanEnd);
            window.removeEventListener('orb-select', handleSelect);
            clearTimeout(hintTimer);
        };
    }, []);

    return (
        <>
            <animated.div style={{
                position: 'fixed',
                top: 0, left: 0,
                width: 0, height: 0,
                zIndex: 9998,
                pointerEvents: 'none',
                transform: pos.to((x, y) => `translate3d(${window.innerWidth/2}px, ${isMobile ? window.innerHeight/2 - 100 : window.innerHeight/2}px, 0)`)
            }}>
                <animated.div style={{
                    width: tetherLength.to(l => Math.max(0, l)),
                    height: '0.2px',
                    background: 'rgba(255,255,255,0.4)',
                    transformOrigin: 'left center',
                    transform: tetherAngle.to(a => `rotate(${a}rad)`)
                }} />
            </animated.div>

            <animated.div
                ref={orbRef}
                style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: 'clamp(80px, 12vh, 120px)',
                    height: 'clamp(80px, 12vh, 120px)',
                    margin: 'clamp(-40px, -6vh, -60px) 0 0 clamp(-40px, -6vh, -60px)',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.6))',
                    backdropFilter: 'blur(30px) saturate(140%)',
                    zIndex: 9999,
                    pointerEvents: 'none', // AI driven, passive
                    transform: pos.to((x, y) => `translate3d(${x}px, ${y}px, 0)`),
                    boxShadow: pulseProps.boxShadow,
                    borderColor: pulseProps.borderColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    overflow: 'hidden',
                    scale: pulseProps.scale,
                    touchAction: 'none'
                }}
            >
                <img 
                    src={avatarUrl || '/assets/Alexhurd1.jpg'} 
                    alt="Guide" 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        opacity: 0.8,
                        filter: 'grayscale(0.2) contrast(1.2)'
                    }} 
                />
                
                {/* Onboarding Guide Tooltip */}
                <animated.div style={{
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    color: '#00e5ff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontFamily: 'Montserrat, sans-serif',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.05em',
                    border: '0.5px solid rgba(0, 229, 255, 0.4)',
                    pointerEvents: 'none',
                    opacity: showHint ? 1 : 0,
                    transition: 'opacity 1.5s ease-in-out'
                }}>
                    {isMobile ? "Drag orb to look & scan" : "Hover & hold to discover"}
                </animated.div>

            </animated.div>
        </>
    );
};
