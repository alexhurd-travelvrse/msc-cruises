import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';
import TeleportBackground from '../components/TeleportBackground';
import FavouritesOverlay from '../components/FavouritesOverlay';
import { playUISound } from '../engine/audioUtils';
import AudioController from '../components/AudioController';
import balconyNew from '../assets/balcony_new.png';
import DigitalGuideOverlay from '../components/DigitalGuideOverlay';

const TeleportPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isFinalMode = queryParams.get('final') === 'true';

    const { travelStatus, setTravelStatus, updateInterest, challenges, updateChallenge } = useGame();
    const { publicConfig, publicInfluencer } = useInfluencer();

    const curatorName = publicInfluencer ? publicInfluencer.name : 'Alex Hurd';
    const brandingTitle = publicConfig?.home?.title?.toUpperCase() || "MSC WORLD EUROPA";
    const voyageTitle = publicConfig?.home?.title || "MSC World Europa";
    const introText = isFinalMode
        ? "FINAL STEP: Complete the loyalty challenge to unlock your total 2,500 points!"
        : "First - Choose Order of Challenges";

    const [timeLeft, setTimeLeft] = useState(isFinalMode ? 0 : 60);
    const [isArriving, setIsArriving] = useState(false);
    const [webglError, setWebglError] = useState(false);

    const experiences = [
        { id: 1, title: 'Luxury Room', category: 'The Sovereign', img: '/assets/balcony_grab.png', reward: 'exclusive soundtrack' },
        { id: 2, title: 'The Spa', category: 'Wellness Voyager', img: '/assets/spa_grab.png', reward: 'exclusive soundtrack' },
        { id: 3, title: 'Tacos Restaurant', category: 'Social Foodie', img: '/assets/hola_grab.png', reward: 'exclusive mojito recipe' },
        { id: 4, title: 'Kids Activities', category: 'Family Planner', img: '/assets/arcade_grab.png', reward: 'exclusive badge' },
        { id: 5, title: 'Excursion', category: 'Culture Seeker', img: '/assets/park.png', reward: 'exclusive concierge guide' },
    ];

    const tieredPromoA = {
        id: 6,
        title: '5% OFF CRUISES & PACKAGES',
        img: '/assets/spa_grab.png',
        reward: 'Access Pass',
        desc: 'Add 1 activity per experience to your backpack to unlock basic status',
        link: 'https://www.msccruises.co.uk/account/callback'
    };

    const tieredPromoB = {
        id: 7,
        title: '10% OFF CRUISES & PACKAGES',
        img: '/assets/balcony_preview.jpg',
        reward: 'Premium Status',
        desc: 'Unlock our premium membership deals for maximum discounts',
        link: 'https://www.msccruises.co.uk/account/callback'
    };

    const [selected, setSelected] = useState([]);
    const [isLoyaltyJoined, setIsLoyaltyJoined] = useState(false);
    const [showFavourites, setShowFavourites] = useState(false);
    const [isBackpackPinging, setIsBackpackPinging] = useState(false);
    const [flyingItems, setFlyingItems] = useState({}); // { key: { x, y, visible } }
    const backpackBtnRef = useRef(null);
    const packItemRefs = useRef({});

    const triggerBackpackPing = () => {
        setIsBackpackPinging(true);
        playUISound('backpack');
        setTimeout(() => setIsBackpackPinging(false), 400);
    };

    const flyToBackpack = (key) => {
        const itemEl = packItemRefs.current[key];
        const bagEl = backpackBtnRef.current;
        if (!itemEl || !bagEl) return;
        const itemRect = itemEl.getBoundingClientRect();
        const bagRect = bagEl.getBoundingClientRect();
        const dx = bagRect.left + bagRect.width / 2 - (itemRect.left + itemRect.width / 2);
        const dy = bagRect.top + bagRect.height / 2 - (itemRect.top + itemRect.height / 2);
        setFlyingItems(prev => ({ ...prev, [key]: { dx, dy, visible: true } }));
        setTimeout(() => setFlyingItems(prev => ({ ...prev, [key]: { ...prev[key], visible: false } })), 500);
    };

    const toggleExperience = (id) => {
        if (isFinalMode) return; // Locked in final mode
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
            playUISound('pop');
        } else {
            if (selected.length < 5) {
                setSelected([...selected, id]);
                triggerBackpackPing();
            }
        }
    };

    const handleLoyaltyComplete = () => {
        navigate('/completion');
    };

    const handleFinish = () => {
        if (isFinalMode) {
            handleLoyaltyComplete();
            return;
        }

        selected.forEach((id, index) => {
            const exp = experiences.find(e => e.id === id);
            if (exp) {
                // Higher interest for earlier selections
                const weight = (5 - index) * 10;
                updateInterest(exp.category, weight);
            }
        });
        
        setIsArriving(true);
        setTimeout(() => {
            navigate(`/experience/${selected[0] || 1}`);
        }, 1500);
    };


    useEffect(() => {
        if (timeLeft > 0 && !isArriving && !isFinalMode) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isArriving && !isFinalMode) {
            handleFinish();
        }
    }, [timeLeft, isArriving, isFinalMode]);

    return (
        <div className={`teleport-page ${isArriving ? 'arriving' : ''}`}>

            {!isArriving && <TeleportBackground voyageTitle={voyageTitle} />}

            <AudioController audioKey="teleport" active={!isArriving && !isFinalMode} />

            {/* Robust CSS/HTML Influencer Orb Overlay - Bottom Left */}
            <DigitalGuideOverlay 
                avatarUrl={publicInfluencer?.avatar || '/assets/Alexhurd1.jpg'} 
                name={`${curatorName} - Digital Guide`}
                isVisible={!isArriving}
                positionStyle={{ bottom: '40px', left: '40px' }}
            />

            {/* Navigation Overlay */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <button
                    className="btn-glass"
                    onClick={() => navigate('/profile')}
                    style={{
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}
                >
                    👤 MY PROFILE
                </button>

            </div>


            <div className="teleport-content container" style={{ height: 'auto', minHeight: '100vh' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '1.5rem', width: '100%', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="status-panel glass-panel animate-fade-in" style={{
                            margin: 0,
                            padding: '32px 24px 12px 24px',
                            textAlign: 'left'
                        }}>
                            <h2 className="status-title" style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '4px', color: 'var(--color-accent-primary)', fontWeight: '800' }}>
                                {isFinalMode ? 'CHALLENGES ALMOST COMPLETE' : 'CHALLENGE COMMENCING'}
                            </h2>
                            {!isFinalMode && (
                                <div className={`status-timer ${timeLeft <= 5 ? 'timer-critical' : ''}`} style={{ marginTop: '4px', fontSize: '1.4rem' }}>
                                    STARTING IN {timeLeft}s
                                </div>
                            )}
                            {isFinalMode && (
                                <div className="status-timer" style={{ color: 'var(--color-accent-primary)', marginTop: '2px', fontSize: '1.4rem' }}>
                                    5 / 5 IMMERSIVE COMPLETE
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                ref={backpackBtnRef}
                                className={`btn-glass ${isBackpackPinging ? 'ping-animation' : ''}`}
                                onClick={() => {
                                    playUISound('ding');
                                    setShowFavourites(true);
                                }}
                                style={{
                                    padding: '12px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'rgba(91, 192, 222, 0.1)',
                                    border: '2px solid var(--color-accent-primary)',
                                    color: 'var(--color-accent-secondary)',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '400',
                                    letterSpacing: '1px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>🎒</span> YOUR BACKPACK
                            </button>
                        </div>
                    </div>
                </div>

                <div className="teleport-grid">
                    {/* Left Side removed for mobile layout */}

                    {/* Right Side: Experience Selection */}
                    <div className="experience-panel glass-panel animate-fade-in animate-delay-2" style={{ flex: 1, minWidth: '0', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 className="panel-title" style={{ marginBottom: '0.5rem', color: 'var(--color-accent-primary)', fontSize: '2.2rem', fontWeight: '800' }}>
                                    {isFinalMode ? curatorName.toUpperCase() + "'S CHALLENGE COMPLETE" : "CURATE YOUR EXPERIENCE"}
                                </h3>
                                <p className="panel-subtitle" style={{ marginBottom: 0, fontSize: '0.9rem', fontWeight: '400', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{introText}</p>
                            </div>
                            
                            {!isFinalMode && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            setTravelStatus({ ...travelStatus, hasFirstTimeBadge: !travelStatus.hasFirstTimeBadge });
                                            if (!travelStatus.hasFirstTimeBadge) triggerBackpackPing();
                                        }}
                                        className={`badge-chip-top ${travelStatus.hasFirstTimeBadge ? 'active' : ''}`}
                                        style={{
                                            padding: '8px 16px', borderRadius: '4px', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase',
                                            background: travelStatus.hasFirstTimeBadge ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${travelStatus.hasFirstTimeBadge ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                                            color: travelStatus.hasFirstTimeBadge ? '#d4af37' : '#fff', cursor: 'pointer'
                                        }}
                                    >
                                        ✨ First Time Cruiser
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTravelStatus({ ...travelStatus, hasSpecialOccasionBadge: !travelStatus.hasSpecialOccasionBadge });
                                            if (!travelStatus.hasSpecialOccasionBadge) triggerBackpackPing();
                                        }}
                                        className={`badge-chip-top ${travelStatus.hasSpecialOccasionBadge ? 'active' : ''}`}
                                        style={{
                                            padding: '8px 16px', borderRadius: '4px', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase',
                                            background: travelStatus.hasSpecialOccasionBadge ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${travelStatus.hasSpecialOccasionBadge ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                                            color: travelStatus.hasSpecialOccasionBadge ? '#d4af37' : '#fff', cursor: 'pointer'
                                        }}
                                    >
                                        🥂 Special Occasion
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="experience-grid-no-scroll">
                            {experiences.map((exp) => {
                                const index = selected.indexOf(exp.id);
                                const isSelected = index !== -1;
                                const isGhosted = isFinalMode;
                                return (
                                    <div
                                        key={exp.id}
                                        onClick={() => toggleExperience(exp.id)}
                                        className={`experience-card-small ${isSelected ? 'selected' : ''} ${isGhosted ? 'ghosted' : ''}`}
                                        style={{
                                            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9), transparent), url(${exp.img})`,
                                            opacity: isGhosted ? 0.6 : 1
                                        }}
                                    >
                                        <div className="card-title" style={{ letterSpacing: '1px', fontWeight: '900', fontSize: '1.1rem' }}>{exp.title}</div>
                                        <div className="reward-pill" style={{ background: 'var(--color-accent-primary)', color: '#000', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>💎 {exp.reward.replace('exclusive', '').trim()}</div>

                                        {(isSelected || isFinalMode) && (
                                            <div className="selection-badge" style={{ background: 'var(--color-accent-primary)', color: '#000', borderRadius: '50%' }}>
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {!isFinalMode && (
                            <div className="teleport-actions-container" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <div className="action-area animate-fade-in animate-delay-3">
                                    <button 
                                        onClick={handleFinish} 
                                        className="btn-primary"
                                        style={{ width: '100%', maxWidth: '400px', padding: '1rem', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)' }}
                                    >
                                        {selected.length > 0 ? 'START YOUR JOURNEY' : 'START ACTIVITIES'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showFavourites && <FavouritesOverlay onClose={() => setShowFavourites(false)} />}

            {/* Flying backpack animations — rendered via portal to escape all stacking contexts */}
            {ReactDOM.createPortal(
                <>
                    {Object.entries(flyingItems).map(([key, item]) =>
                        item.visible && packItemRefs.current[key] ? (
                            <div
                                key={key}
                                style={{
                                    position: 'fixed',
                                    top: packItemRefs.current[key].getBoundingClientRect().top,
                                    left: packItemRefs.current[key].getBoundingClientRect().left,
                                    width: packItemRefs.current[key].getBoundingClientRect().width,
                                    height: packItemRefs.current[key].getBoundingClientRect().height,
                                    background: 'rgba(0,229,255,0.25)',
                                    border: '2px solid rgba(0,229,255,0.6)',
                                    borderRadius: '16px',
                                    zIndex: 999999,
                                    pointerEvents: 'none',
                                    animation: 'flyToBag 0.55s cubic-bezier(0.4,0,0.2,1) forwards',
                                    '--dx': `${item.dx}px`,
                                    '--dy': `${item.dy}px`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>🎒</span>
                            </div>
                        ) : null
                    )}
                </>,
                document.body
            )}
        </div>
    );
};

export default TeleportPage;
