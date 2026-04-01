import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ExperienceCanvas from '../components/ExperienceCanvas';
import NauticalLoader from '../components/NauticalLoader';
import FavouritesOverlay from '../components/FavouritesOverlay';
import DigitalGuideOverlay from '../components/DigitalGuideOverlay';
import Joystick from '../components/Joystick';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';
import { sceneConfig } from '../data/sceneConfig';
import SceneEditor from '../components/SceneEditor';
import StartOverlay from '../components/StartOverlay';
import AudioController from '../components/AudioController';
import { offerDatabase, calculateLiveOfferDiscount } from '../data/offerDatabase';

const YouTubePlayer = ({ url, previewImage }) => {
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|youtube.com\/shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(url);

    return (
        <div 
            onClick={() => window.open(url, '_blank')}
            className="video-click-to-play"
            style={{ 
                width: '100%', 
                height: '200px', 
                borderRadius: '12px', 
                background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${previewImage || '/assets/balcony_grab.png'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: '1px solid rgba(255,215,0,0.3)'
            }}
        >
            <div style={{ 
                width: '60px', 
                height: '60px', 
                background: '#FFD700', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(255,215,0,0.5)',
                fontSize: '1.5rem'
            }}>
                ▶
            </div>
            <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                fontSize: '0.7rem',
                color: '#fff',
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 8px',
                borderRadius: '4px'
            }}>
                OPEN ON YOUTUBE ↗
            </div>
        </div>
    );
};

const ExperiencePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { resetProgress, updateChallenge, addToBackpack, getTotalCoins, influencer, backpack, trackTime, getTopInterest, itemsViewed, setItemsViewed } = useGame();
    const { publicConfig, publicInfluencer, resetToTruth } = useInfluencer();
    const curatorName = publicInfluencer?.name || 'Alex';
    const brandingTitle = publicConfig?.home?.title?.toUpperCase() || "MSC WORLD EUROPA";
    const brandingSubtitle = publicConfig?.home?.subtitle || "Virtual Cruise Experience";

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const showEditor = queryParams.get('editor') === 'true';

    const [lastId, setLastId] = useState(id);
    const [modal, setModal] = useState(null);
    const [showFavourites, setShowFavourites] = useState(false);
    const [backpackUpdated, setBackpackUpdated] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isSplatLoaded, setIsSplatLoaded] = useState(false);
    const [isItemsAllowed, setIsItemsAllowed] = useState(false);
    const [isOrbAllowed, setIsOrbAllowed] = useState(false);
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [activeEditorObject, setActiveEditorObject] = useState(null);
    const [editorObjects, setEditorObjects] = useState([]);
    const [dialValues, setDialValues] = useState([0, 0, 0, 0]);
    const [puzzleError, setPuzzleError] = useState(false);
    const [activeLiveOffer, setActiveLiveOffer] = useState(null);
    const [nextRoomProgress, setNextRoomProgress] = useState(0);
    const [nextRoomReady, setNextRoomReady] = useState(false);
    const startTimeRef = useRef(Date.now());

    // URL-driven state reset for robustness
    useEffect(() => {
        if (queryParams.get('reset') === 'true') {
            console.log('%c[ExperiencePage] Reset cleanup from URL parameter', 'color: #ff0000; font-weight: bold;');
            // Progress was already cleared by the function that redirected here
            
            // Clean URL after reset to prevent loop
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, navigate]);

    // Immediate state reset if room ID changes during render
    if (id !== lastId) {
        setIsStarted(false);
        setIsSplatLoaded(false);
        setIsItemsAllowed(false);
        setIsOrbAllowed(false);
        setModal(null);
        setNextRoomProgress(0);
        setNextRoomReady(false);
        setLastId(id);
        startTimeRef.current = Date.now();
    }

    // Apply editor mode from URL
    useEffect(() => {
        if (showEditor) {
            setIsEditorMode(true);
        }
    }, [showEditor]);

    // Handle Editor state sync
    useEffect(() => {
        const handleEditorUpdate = (e) => {
            if (e.detail && e.detail.objects) {
                setEditorObjects(e.detail.objects);
            }
        };
        window.addEventListener('scene-editor-update', handleEditorUpdate);
        
        // Request sync if editor opens
        if (isEditorMode) {
            window.dispatchEvent(new CustomEvent('scene-editor-request-sync'));
        }
        
        return () => window.removeEventListener('scene-editor-update', handleEditorUpdate);
    }, [isEditorMode]);

    // Reset room items when changing experiences
    useEffect(() => {
        setModal(null);
    }, [id]);

    useEffect(() => {
        const handleProgressReset = () => {
            console.log('[ExperiencePage] Global progress reset received - clearing itemsViewed');
            setItemsViewed([]);
            setIsOrbAllowed(false);
        };
        window.addEventListener('msc-progress-reset', handleProgressReset);
        return () => window.removeEventListener('msc-progress-reset', handleProgressReset);
    }, []);

    useEffect(() => {
        const handleSplatLoaded = () => {
            console.log('[ExperiencePage] Splat loaded signal');
            setIsSplatLoaded(true);
        };
        window.addEventListener('msc-splat-loaded', handleSplatLoaded);
        return () => window.removeEventListener('msc-splat-loaded', handleSplatLoaded);
    }, []);

    useEffect(() => {
        if (isSplatLoaded) {
            console.log('[ExperiencePage] Splat loaded - Auto-starting experience');
            setIsStarted(true);
            window.dispatchEvent(new CustomEvent('msc-items-allowed'));
            setIsItemsAllowed(true);
        }
    }, [isSplatLoaded]);

    // Standardized check for coin reveal
    useEffect(() => {
        const roomItems = publicConfig?.experiences?.[id]?.items || [];
        const viewedInThisRoom = roomItems.filter(item => itemsViewed.includes(item.id)).length;
        
        console.log(`[ExperiencePage] Room ${id} Progress: ${viewedInThisRoom}/${roomItems.length}`, { itemsViewed });
        
        if (roomItems.length > 0 && viewedInThisRoom >= roomItems.length) {
            console.log("[ExperiencePage] Room complete - revealing coin/medal");
            setIsOrbAllowed(true);
        } else {
            setIsOrbAllowed(false);
        }
    }, [id, itemsViewed, publicConfig]);

    // Handle interactions
    useEffect(() => {
        const handleObjectClick = (e) => {
            const { name, experienceId } = e.detail;
            if (String(id) !== String(experienceId)) return;

            const roomConfig = publicConfig?.experiences?.[id];

            if (name === 'Coin' || name === 'msc-medal' || name === 'SovereignCoin') {
                const dynamicCoin = publicConfig?.coins?.[id];
                
                // USER REQUEST: Skip modal and collect immediately
                const itemToAdd = {
                    id: `medal-${id}`,
                    title: dynamicCoin?.title || 'Sovereign Reward',
                    description: dynamicCoin?.text || 'Reward collected',
                    image: dynamicCoin?.image || '/textures/coin.png',
                    type: 'medal',
                    icon: '🏅',
                    collectible: true
                };
                
                addToBackpack(itemToAdd);
                updateChallenge(`exp-${id}`, { coinFound: true });
                window.dispatchEvent(new CustomEvent('trigger-confetti'));
                
                setActiveLiveOffer({ baseTitle: "Elite Reward Unlocked!", icon: '🏅', discount: 0 });
                setBackpackUpdated(true);
                setTimeout(() => setBackpackUpdated(false), 2000);
                setTimeout(() => setActiveLiveOffer(null), 3000);

                // Auto-transition
                setTimeout(() => {
                    const nextId = parseInt(id) + 1;
                    if (nextId <= 5) navigate(`/experience/${nextId}`);
                    else navigate('/completion');
                }, 2000);

            } else if (name === 'TVControl' || name === 'ActivityObject' || name === 'BackpackItem' || name === 'RacingCarSimulator' || name === 'YachtClubStar') {
                const items = roomConfig?.items || [];
                // If BackpackItem provides itemIndex, use it, otherwise fall back to name-based logic
                const idx = (e.detail.itemIndex !== undefined) ? e.detail.itemIndex : ((name === 'TVControl') ? 0 : 1);
                const dynamicItem = items[idx] || items[0];
                
                if (dynamicItem) {
                    setModal({
                        title: dynamicItem.name,
                        description: dynamicItem.text,
                        image: dynamicItem.media || '/assets/balcony_grab.png',
                        video: dynamicItem.video,
                        collectible: dynamicItem.collectible,
                        type: 'activity',
                        id: dynamicItem.id
                    });
                }
            }
        };

        window.addEventListener('object-clicked', handleObjectClick);
        return () => window.removeEventListener('object-clicked', handleObjectClick);
    }, [id, publicConfig]);

    const handleCloseModal = () => {
        if (modal && modal.id) {
            const newViewed = [...new Set([...itemsViewed, modal.id])];
            setItemsViewed(newViewed);
            
            // USER REQUEST: Only show coin after 2 items are viewed
            if (newViewed.length >= 2) {
                setIsOrbAllowed(true);
                window.dispatchEvent(new CustomEvent('msc-orb-allowed'));
            }
        }
        setModal(null);
    };

    const handleAddToBackpackClick = () => {
        if (modal) {
            const itemToAdd = {
                id: modal.id,
                title: modal.title,
                description: modal.description,
                type: modal.type,
                image: modal.image,
                icon: modal.type === 'medal' ? '🏅' : '🎒',
                collectible: modal.collectible,
                video: modal.video
            };
            addToBackpack(itemToAdd);
            
            // Mark challenge as complete for this room if a medal is found
            if (modal.type === 'medal') {
                updateChallenge(`exp-${id}`, { coinFound: true });
                
                // Trigger Confetti Moment
                window.dispatchEvent(new CustomEvent('trigger-confetti'));
                
                // Close modal immediately so user sees the reward moment in the room
                setModal(null);

                // USER REQUEST: Auto-transition on coin/medal collection
                setTimeout(() => {
                    const nextId = parseInt(id) + 1;
                    if (nextId <= 5) navigate(`/experience/${nextId}`);
                    else navigate('/completion');
                }, 2000); 
                
                setActiveLiveOffer({ baseTitle: "Elite Reward Unlocked!", icon: '🏅', discount: 0 });
            } else {
                updateChallenge(`exp-${id}`, { objectsFound: 1 });
                handleCloseModal();
                setActiveLiveOffer({ baseTitle: modal.title, icon: '🎒', discount: 0 });
            }

            setBackpackUpdated(true);
            setTimeout(() => setBackpackUpdated(false), 2000);
            setTimeout(() => setActiveLiveOffer(null), 3000);
        }
    };

    const currentTheme = {
        '1': { primary: '#d4af37', label: 'YACHT CLUB' },
        '2': { primary: '#00e5ff', label: 'SPA' },
        '3': { primary: '#ff8c00', label: 'SOCIAL' },
        '4': { primary: '#ff3d00', label: 'RACING' },
        '5': { primary: '#ffcc00', label: 'CULTURE' }
    }[id] || { primary: '#d4af37', label: 'YACHT CLUB' };

    return (
        <div className="experience-container" style={{ touchAction: 'none' }}>
            {/* Loading Spinner - Only shown when splat is still loading */}
            {!isSplatLoaded && (
                <NauticalLoader isVisible={true} isSplatLoaded={false} />
            )}

            <DigitalGuideOverlay 
                avatarUrl={publicConfig?.home?.influencerPhoto || '/assets/Alexhurd1.jpg'} 
                name={`${publicInfluencer?.name || 'Alex'} - Guide`}
                isVisible={isStarted}
                positionStyle={{ left: '20px', top: '50%', transform: 'translateY(-50%)', bottom: 'auto', right: 'auto' }}
            />


            {isStarted && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9005, pointerEvents: 'none' }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <SceneEditor 
                            experienceId={id} 
                            activeObject={activeEditorObject} 
                            setActiveObject={setActiveEditorObject}
                            objects={editorObjects} 
                            isEditorMode={isEditorMode}
                            setIsEditorMode={setIsEditorMode}
                        />
                    </div>
                </div>
            )}

            <AudioController audioKey={id} active={isStarted} script={publicConfig?.audio?.[id]} />



            <div className="experience-canvas-layer">
                <ExperienceCanvas 
                    experienceId={id} 
                    isInteractionActive={showFavourites || !!modal || isEditorMode} 
                    isStarted={isStarted} 
                    isItemsAllowed={isItemsAllowed}
                    isOrbAllowed={isOrbAllowed}
                    itemsViewed={itemsViewed} 
                />
            </div>

            <div className="hud-overlay">
                <div className="hud-top-bar">
                    <div className="location-badge" onClick={() => navigate('/')}>{brandingTitle}</div>
                    
                    <div className="hud-center-stats" style={{ display: 'flex', gap: '12px' }}>
                        {isStarted && (
                           <div className="vibe-badge-top glass-panel" style={{ borderLeft: `3px solid ${currentTheme.primary}` }}>
                               <span className="vibe-label" style={{ color: currentTheme.primary }}>VIBE: {currentTheme.label}</span>
                               <span className="vibe-val">{getTopInterest().toUpperCase()}</span>
                           </div>
                        )}
                    </div>

                    <div className="hud-stats" style={{ display: 'flex', gap: '10px' }}>
                        <div className="medal-box glass-panel" style={{ color: '#ffd700', padding: '8px 20px', fontSize: '0.85rem' }}>
                            🏅 {getTotalCoins()} / 5
                        </div>
                        <div className={`backpack-box glass-panel ${backpackUpdated ? 'backpack-glow' : ''}`} style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => setShowFavourites(true)}>
                            🎒 {backpack.length} ITEMS
                        </div>
                    </div>
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className={`interaction-modal glass-panel animate-fade-in ${modal.type === 'medal' ? 'medal-modal' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-accent" style={{ background: modal.type === 'medal' ? 'linear-gradient(90deg, transparent, #FFD700, transparent)' : `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)` }}></div>
                        
                        {modal.video ? (
                            <YouTubePlayer url={modal.video} previewImage={modal.image} />
                        ) : modal.image && (
                            <div className="modal-media-container">
                                <img src={modal.image} className="modal-img" alt={modal.title} />
                            </div>
                        )}
                        
                        <div className="modal-content-details">
                            <h3 className="modal-title" style={{ color: modal.type === 'medal' ? '#FFD700' : currentTheme.primary }}>{modal.title.toUpperCase()}</h3>
                            <p className="modal-desc">{modal.description}</p>
                            
                            {modal.collectible && (
                                <div className="collectible-notice">
                                    <span className="collectible-badge">🎒 COLLECTIBLE ITEM</span>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button onClick={handleAddToBackpackClick} className={modal.type === 'medal' ? 'btn-gold-pulse' : 'btn-primary'}>
                                    {modal.type === 'medal' ? 'UNLOCK REWARD 🏅' : 'ADD TO BACKPACK'}
                                </button>
                                <button onClick={handleCloseModal} className="btn-close-minimal">✕ CLOSE</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showFavourites && <FavouritesOverlay onClose={() => setShowFavourites(false)} />}
            
            <div className="nav-complete-container">
                <button onClick={() => {
                    const nextId = parseInt(id) + 1;
                    if (nextId <= 5) navigate(`/experience/${nextId}`);
                    else navigate('/completion');
                }} className="btn-primary">NEXT EXPERIENCE &rarr;</button>
            </div>
        </div>
    );
};

export default ExperiencePage;
