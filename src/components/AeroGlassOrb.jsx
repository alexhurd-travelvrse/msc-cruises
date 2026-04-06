import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export const AeroGlassOrb = ({ onClick, avatarUrl }) => {
    const orbRef = useRef(null);
    const [isMobile] = useState(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const [showHint, setShowHint] = useState(true);
    
    const [{ pos }, api] = useSpring(() => ({
        pos: [window.innerWidth / 2, window.innerHeight / 2],
        config: { mass: 1, tension: 170, friction: 26 }
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
            const { screenPos, isMobile: eventIsMobile, tether } = e.detail;
            
            // Only PC follows cursor entirely
            if (!eventIsMobile) {
                api.start({ pos: [screenPos.x, screenPos.y], immediate: true });
            }

            if (tether) {
                tetherApi.start({ tetherLength: tether.length, tetherAngle: tether.angle });
            } else {
                tetherApi.start({ tetherLength: 0 });
            }
        };

        const handleScanStart = () => {
            interactState.current.isScanning = true;
            pulseApi.start({
                scale: 1.1,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(0, 150, 255, 0.8), inset 0 0 30px rgba(0, 229, 255, 0.5)',
                borderColor: 'rgba(0, 229, 255, 0.8)'
            });
        };

        const handleScanEnd = () => {
            interactState.current.isScanning = false;
            pulseApi.start({
                scale: 1,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
            });
        };

        const handleSelect = () => {
            // Quick pulse for click
            pulseApi.start({ scale: 0.9, config: { duration: 100 } });
            setTimeout(() => {
                pulseApi.start({ scale: 1 });
            }, 100);
            if(onClick) onClick();
        };

        window.addEventListener('orb-update', handleUpdate);
        window.addEventListener('orb-scan-start', handleScanStart);
        window.addEventListener('orb-scan-end', handleScanEnd);
        window.addEventListener('orb-select', handleSelect);

        const hintTimer = setTimeout(() => setShowHint(false), 7000);

        return () => {
            window.removeEventListener('orb-update', handleUpdate);
            window.removeEventListener('orb-scan-start', handleScanStart);
            window.removeEventListener('orb-scan-end', handleScanEnd);
            window.removeEventListener('orb-select', handleSelect);
            clearTimeout(hintTimer);
        };
    }, []);

    // Mobile Pointer Events
    const handlePointerDown = (e) => {
        if (!isMobile) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        interactState.current.pointerDown = true;
    };

    const handlePointerMove = (e) => {
        if (!isMobile || !interactState.current.pointerDown) return;
        
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2 - 100; // offset slightly for mobile thumb
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        api.start({ pos: [e.clientX, e.clientY], immediate: true });

        // Dispatch to camera
        const normalizedX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 3)));
        const normalizedY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 3)));
        
        window.dispatchEvent(new CustomEvent('orb-update', { 
            detail: { 
                screenPos: { x: e.clientX, y: e.clientY }, 
                cameraMove: { x: normalizedX, y: normalizedY }, 
                isMobile: true,
                tether: { 
                    length: Math.sqrt(dx*dx + dy*dy), 
                    angle: Math.atan2(dy, dx) 
                } 
            } 
        }));
    };

    const handlePointerUp = (e) => {
        if (!isMobile) return;
        interactState.current.pointerDown = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
        
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2 - 100;
        
        api.start({ pos: [cx, cy] });
        tetherApi.start({ tetherLength: 0 });
        
        window.dispatchEvent(new CustomEvent('orb-update', { 
            detail: { 
                screenPos: { x: cx, y: cy }, 
                cameraMove: { x: 0, y: 0 }, 
                isMobile: true,
                tether: { length: 0, angle: 0 }
            } 
        }));
    };

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
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
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
                    pointerEvents: isMobile ? 'auto' : 'none', // Active on mobile for touch, passive on PC
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
