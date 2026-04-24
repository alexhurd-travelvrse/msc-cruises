import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';

const ChallengeSystem = ({ experienceId }) => {
    const { backpack, challenges, updateChallenge, getTotalCoins } = useGame();
    const { publicConfig, manifest } = useInfluencer();
    
    const [showCoinAnimation, setShowCoinAnimation] = useState(false);
    const [justAwarded, setJustAwarded] = useState(false);
    
    // Items found in THIS specific experience
    const roomItemsFound = backpack.filter(item => {
        // Find if this item belongs to this room in the config
        const exp = publicConfig?.experiences?.[experienceId];
        const roomItemIds = (exp?.backpack_icons || exp?.items || []).map(i => i.id);
        return roomItemIds.includes(item.id);
    });

    const progress = Math.min(roomItemsFound.length, 2);
    const hasCoin = challenges[experienceId]?.coinFound;
    
    const currentThemeColor = manifest?.client_metadata?.brand_assets?.primary_color || '#00e5ff';

    // Trigger Coin Award when 2 items are found
    useEffect(() => {
        if (progress === 2 && !hasCoin && !justAwarded) {
            setJustAwarded(true);
            setTimeout(() => {
                setShowCoinAnimation(true);
                window.dispatchEvent(new CustomEvent('trigger-confetti'));
                window.dispatchEvent(new CustomEvent('coin-awarded'));
            }, 800);
        }
    }, [progress, hasCoin, justAwarded, experienceId]);

    const coinSpring = useSpring({
        from: { transform: 'scale(0) rotate(0deg)', opacity: 0 },
        to: async (next) => {
            if (showCoinAnimation) {
                await next({ transform: 'scale(1.5) rotate(360deg)', opacity: 1, config: config.wobbly });
                await new Promise(resolve => setTimeout(resolve, 2000));
                await next({ transform: 'scale(0) translate(200px, -400px)', opacity: 0, config: config.slow });
                setShowCoinAnimation(false);
                updateChallenge(experienceId, { coinFound: true });
            }
        }
    });

    return (
        <div className="challenge-system-hud" style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            zIndex: 9005,
            pointerEvents: 'none'
        }}>
            {/* Progress Tray removed as per user request */}

            {/* Medal Box is now in the Top Right Dock or Side Dock (handled in ExperiencePage) */}


            {/* Large Coin Award Animation */}
            {showCoinAnimation && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10001 }}>
                    <animated.div style={{
                        ...coinSpring,
                        fontSize: '8rem',
                        filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))',
                        textAlign: 'center'
                    }}>
                        🪙
                        <div className="serif-title" style={{ fontSize: '2rem', color: '#FFD700', marginTop: '20px', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                            MEDAL EARNED
                        </div>
                    </animated.div>
                </div>
            )}
        </div>
    );
};

export default ChallengeSystem;
