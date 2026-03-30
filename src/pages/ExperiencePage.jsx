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

const ExperiencePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateChallenge, addToBackpack, getTotalCoins, influencer, backpack, trackTime, getTopInterest } = useGame();
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
    const [itemsViewed, setItemsViewed] = useState([]);
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

    // Immediate state reset if room ID changes during render
    if (id !== lastId) {
        setIsStarted(false);
        setIsSplatLoaded(false);
        setIsItemsAllowed(false);
        setIsOrbAllowed(false);
        setItemsViewed([]);
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
        setItemsViewed([]);
        setModal(null);
    }, [id]);

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

    // Handle interactions
    useEffect(() => {
        const handleObjectClick = (e) => {
            const { name, experienceId } = e.detail;
            if (String(id) !== String(experienceId)) return;

            const roomConfig = publicConfig?.experiences?.[id];

            if (name === 'Coin' || name === 'msc-medal') {
                const dynamicCoin = publicConfig?.coins?.[id];
                setModal({
                    title: dynamicCoin?.title || 'Secret Clue Found',
                    description: dynamicCoin?.text || 'Clue discovered!',
                    image: dynamicCoin?.image || '/textures/coin.png',
                    type: 'medal',
                    id: `medal-${id}`
                });
            } else if (name === 'TVControl' || name === 'ActivityObject' || name === 'RacingCarSimulator') {
                const dynamicItem = roomConfig?.items?.[name === 'TVControl' ? 0 : 1] || roomConfig?.items?.[0];
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
            
            const roomItemsCount = publicConfig?.experiences?.[id]?.items?.length || 1;
            if (newViewed.length >= roomItemsCount) {
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
                
                // USER REQUEST: Auto-transition on coin/medal collection
                setTimeout(() => {
                    handleCloseModal();
                    const nextId = parseInt(id) + 1;
                    if (nextId <= 5) navigate(`/experience/${nextId}`);
                    else navigate('/completion');
                }, 1000); 
                
                setActiveLiveOffer({ baseTitle: "Medal Collected!", icon: '🏅', discount: 0 });
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
                <ExperienceCanvas experienceId={id} isInteractionActive={showFavourites || !!modal || isEditorMode} isStarted={isStarted} itemsViewed={itemsViewed} />
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

                    <div className="hud-stats" style={{ display: 'flex', gap: '12px' }}>
                        <div className="medal-box glass-panel" style={{ color: '#ffd700' }}>
                            🏅 {getTotalCoins()} / 5
                        </div>
                        <div className={`backpack-box glass-panel ${backpackUpdated ? 'backpack-glow' : ''}`} onClick={() => setShowFavourites(true)}>
                            🎒 {backpack.length} ITEMS
                        </div>
                    </div>
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className={`interaction-modal glass-panel animate-fade-in ${modal.type === 'medal' ? 'medal-modal' : ''}`} onClick={(e) => e.stopPropagation()}>
                        {modal.video ? (
                            <div style={{ marginBottom: '15px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                                <video src={modal.video} autoPlay loop controls style={{ width: '100%', display: 'block' }} />
                            </div>
                        ) : modal.image && (
                            <div style={{ marginBottom: '15px' }}>
                                <img src={modal.image} style={{ width: '100%', borderRadius: '12px' }} alt={modal.title} />
                            </div>
                        )}
                        <h3 className="modal-title">{modal.title}</h3>
                        <p className="modal-desc">{modal.description}</p>
                        <div className="modal-actions">
                            {(modal.type === 'activity' || modal.type === 'medal') && (
                                <button onClick={handleAddToBackpackClick} className="btn-primary">
                                    ADD TO BACKPACK
                                </button>
                            )}
                            <button onClick={handleCloseModal} className="btn-glass">CLOSE</button>
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
