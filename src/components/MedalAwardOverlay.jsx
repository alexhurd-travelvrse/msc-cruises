import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
const MedalAwardOverlay = ({ isVisible, medalTitle, medalType, onClose }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    const overlaySpring = useSpring({
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        config: { tension: 120, friction: 14 }
    });

    const cardSpring = useSpring({
        transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(100px) scale(0.8)',
        opacity: isVisible ? 1 : 0,
        config: { tension: 200, friction: 20 }
    });

    useEffect(() => {
        if (isVisible) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    return (
        <animated.div style={{
            ...overlaySpring,
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 5, 15, 0.9)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>

            <animated.div style={{
                ...cardSpring,
                width: '100%',
                maxHeight: '90vh',
                maxWidth: '450px',
                background: 'rgba(20, 20, 45, 0.7)',
                border: '1px solid rgba(255, 215, 0, 0.5)',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(255, 215, 0, 0.1)'
            }}>
                <div style={{
                    fontSize: '0.7rem',
                    letterSpacing: '4px',
                    color: '#FFD700',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    marginBottom: '20px'
                }}>
                    Collectible Discovered
                </div>

                <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, #FFD700 0%, #B8860B 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '30px',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
                    fontSize: '4rem'
                }}>
                    🏅
                </div>

                <h2 className="serif-title" style={{ fontSize: '2.5rem', marginBottom: '15px', color: 'white' }}>
                    {medalTitle}
                </h2>

                <p style={{ 
                    fontSize: '0.9rem', 
                    lineHeight: '1.6', 
                    color: 'rgba(255,255,255,0.7)', 
                    marginBottom: '40px',
                    maxWidth: '300px'
                }}>
                    This exclusive reward has been added to your backpack and can be viewed or downloaded at any time.
                </p>

                <button 
                    onClick={onClose}
                    className="ghost-button"
                    style={{ 
                        width: '100%', 
                        padding: '18px', 
                        fontSize: '0.8rem',
                        borderColor: '#FFD700',
                        color: '#FFD700',
                        background: 'rgba(255, 215, 0, 0.05)'
                    }}
                >
                    ADD TO BACKPACK
                </button>
            </animated.div>
        </animated.div>
    );
};

export default MedalAwardOverlay;
