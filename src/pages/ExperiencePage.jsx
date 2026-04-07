import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ExperienceCanvas from '../components/ExperienceCanvas';
import NauticalLoader from '../components/NauticalLoader';
import FavouritesOverlay from '../components/FavouritesOverlay';
import { AeroGlassOrb } from '../components/AeroGlassOrb';
import { InputManager } from '../components/InputManager';
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
    const { publicConfig, publicInfluencer, resetToTruth, saveConfig } = useInfluencer();
    const curatorName = publicInfluencer?.name || 'Alex';
    const brandingTitle = publicConfig?.home?.title?.toUpperCase() || "MSC WORLD EUROPA";
    const brandingSubtitle = publicConfig?.home?.subtitle || "Virtual Cruise Experience";

    const location = useLocation();
    
    // Joystick toggle state
    const [isMobile] = useState(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    const [activeCompanyId, setActiveCompanyId] = useState(import.meta.env.VITE_ACTIVE_COMPANY || null);
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
            window.dispatchEvent(new CustomEvent('orb-pulse'));
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

            <InputManager />

            {isStarted && <AeroGlassOrb 
                avatarUrl={publicConfig?.home?.influencerPhoto || '/assets/Alexhurd1.jpg'} 
                onClick={() => {
                    // Tap on Orb acts as a global scan pulse
                    window.dispatchEvent(new CustomEvent('orb-scan-start', { detail: { x: window.innerWidth/2, y: window.innerHeight/2 } }));
                    setTimeout(() => window.dispatchEvent(new CustomEvent('orb-scan-end')), 1000);
                }}
            />}

            {isStarted && isMobile && <Joystick color={currentTheme.primary} />}

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
                            onResetToTruth={resetToTruth}
                            onDownloadConfig={() => {
                                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(publicConfig, null, 4));
                                const downloadAnchorNode = document.createElement('a');
                                downloadAnchorNode.setAttribute("href", dataStr);
                                downloadAnchorNode.setAttribute("download", `msc_config_exp_${id}.json`);
                                document.body.appendChild(downloadAnchorNode);
                                downloadAnchorNode.click();
                                downloadAnchorNode.remove();
                            }}
                            onImport={async (importedConfig) => {
                                const companyId = publicConfig?.id || 'msc-cruises';
                                await saveConfig(null, companyId, importedConfig);
                                console.log("[ExperiencePage] Successfully imported JSON payload from file.");
                                alert("JSON imported and saved! Please hard-refresh your browser.");
                            }}
                            onSaveToContext={async (objs) => {
                                // Merge editor objects into the current public config
                                const newConfig = { ...publicConfig };
                                if (!newConfig.experiences) newConfig.experiences = {};
                                if (!newConfig.experiences[id]) newConfig.experiences[id] = { items: [] };
                                
                                const exp = newConfig.experiences[id];
                                objs.forEach(obj => {
                                    if (obj.id === 'camera') {
                                        exp.startPos = obj.pos;
                                        exp.startRot = obj.rot;
                                    } else if (obj.id === 'coin') {
                                        if (!exp.coin) exp.coin = {};
                                        exp.coin.position = obj.pos;
                                        exp.coin.rotation = obj.rot;
                                    } else {
                                        // Standard items
                                        if (!exp.items) exp.items = [];
                                        const idx = exp.items.findIndex(i => i.id === obj.id);
                                        if (idx !== -1) {
                                            exp.items[idx].position = obj.pos;
                                            exp.items[idx].rotation = obj.rot;
                                            if (obj.discoveryMode) exp.items[idx].discoveryMode = obj.discoveryMode;
                                            if (obj.audioUrl !== undefined) {
                                                if (!exp.items[idx].collectible) exp.items[idx].collectible = {};
                                                exp.items[idx].collectible.url = obj.audioUrl;
                                            }
                                        }
                                    }
                                });
                                
                                const companyId = publicConfig?.id || 'msc-cruises';
                                await saveConfig(null, companyId, newConfig);
                                console.log("[ExperiencePage] Saved 3D Editor configuration to local Context");
                                return { success: true };
                            }}
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

            <div className="hud-overlay" onMouseEnter={() => console.log('[HUD] ROOT OVERLAY ENTERED')} style={{ pointerEvents: 'none' }}>
                <div className="hud-top-bar" style={{ padding: '20px 40px', pointerEvents: 'auto' }}>
                    <div className="location-badge metadata-label" onClick={() => navigate('/')} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
                        {brandingTitle}
                    </div>
                    
                    <div className="hud-center-stats" style={{ display: 'flex', gap: '24px' }}>
                        {isStarted && (
                           <div className="vibe-badge-top" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                               <div className="metadata-label" style={{ color: currentTheme.primary, marginBottom: '4px' }}>Vibe Sector</div>
                               <div className="serif-title" style={{ fontSize: '1.2rem' }}>{getTopInterest().toUpperCase()}</div>
                           </div>
                        )}
                    </div>

                    <div className="hud-right-actions">
                         <button className="ghost-button" 
                                 onMouseEnter={() => {
                                     console.log('[HUD] Hover: Exit Button triggered');
                                     window.dispatchEvent(new CustomEvent('orb-look-at', { detail: { x: 25, y: -25 } }));
                                     window.dispatchEvent(new CustomEvent('orb-pulse'));
                                 }}
                                 onMouseLeave={() => {
                                     console.log('[HUD] Leave: Exit Button');
                                     window.dispatchEvent(new CustomEvent('orb-look-at', { detail: { x: 0, y: 0 } }));
                                 }}
                                 onClick={() => navigate('/')}>Exit HUD</button>
                    </div>
                </div>

                {/* Vertical Side-Dock for Backpack & Medals */}
                <div className="hud-side-dock" style={{ 
                    position: 'fixed', 
                    right: '40px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '15px',
                    zIndex: 9010, // Increased z-index
                    fontFamily: 'Outfit, sans-serif',
                    pointerEvents: 'auto' // Fix for backpack clickability
                }}>
                    <div className="metadata-label" style={{ 
                        writingMode: 'vertical-rl', 
                        transform: 'rotate(180deg)', 
                        marginBottom: '15px',
                        fontSize: '0.6rem',
                        letterSpacing: '0.3em',
                        color: 'rgba(255,255,255,0.4)',
                        textAlign: 'center'
                    }}>INVENTORY</div>
                    
                    <div className={`backpack-box ${backpackUpdated ? 'backpack-glow' : ''}`} 
                         style={{ 
                             width: '64px', 
                             height: '84px', 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center', 
                             flexDirection: 'column',
                             cursor: 'pointer',
                             background: 'rgba(255, 255, 255, 0.03)',
                             backdropFilter: 'blur(10px)',
                             border: '0.5px solid rgba(255, 255, 255, 0.15)',
                             borderRadius: '2px', // Leica Hard Edge
                             transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                             boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                         }} 
                         onMouseEnter={(e) => {
                             window.dispatchEvent(new CustomEvent('orb-look-at', { detail: { x: 35, y: -15 } }));
                             window.dispatchEvent(new CustomEvent('orb-pulse'));
                             e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                             e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                             e.currentTarget.style.transform = 'translateX(-10px)';
                         }}
                         onMouseLeave={(e) => {
                             window.dispatchEvent(new CustomEvent('orb-look-at', { detail: { x: 0, y: 0 } }));
                             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                             e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                             e.currentTarget.style.transform = 'translateX(0)';
                         }}
                         onClick={() => setShowFavourites(true)}>
                        <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>🎒</span>
                        <span className="metadata-label" style={{ fontSize: '0.7rem', marginTop: '8px', color: '#fff' }}>{backpack.length}</span>
                        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px', letterSpacing: '0.1em' }}>LOGS</div>
                    </div>

                    <div className="medal-box" 
                         style={{ 
                             width: '64px', 
                             height: '84px', 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center', 
                             flexDirection: 'column',
                             background: 'rgba(255, 255, 255, 0.03)',
                             backdropFilter: 'blur(10px)',
                             border: '0.5px solid rgba(255, 255, 255, 0.15)',
                             borderRadius: '2px', // Leica Hard Edge
                             transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                             boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                         }}
                         onMouseEnter={(e) => {
                             window.dispatchEvent(new CustomEvent('orb-look-at', { detail: { x: 35, y: 15 } }));
                             window.dispatchEvent(new CustomEvent('orb-pulse'));
                             e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)';
                             e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)';
                             e.currentTarget.style.transform = 'translateX(-10px)';
                         }}
                         onMouseLeave={(e) => {
                             window.dispatchEvent(new CustomEvent('orb-look-at', { detail: { x: 0, y: 0 } }));
                             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                             e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                             e.currentTarget.style.transform = 'translateX(0)';
                         }}
                    >
                        <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.3))' }}>🏅</span>
                        <span className="metadata-label" style={{ fontSize: '0.7rem', marginTop: '8px', color: '#fff' }}>{getTotalCoins()}</span>
                        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px', letterSpacing: '0.1em' }}>MERITS</div>
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
                        
                        <div className="modal-content-details" style={{ textAlign: 'left', padding: '20px 0' }}>
                            <div className="metadata-label" style={{ color: modal.type === 'medal' ? '#FFD700' : currentTheme.primary, marginBottom: '8px' }}>Asset Identified</div>
                            <h3 className="serif-title" style={{ fontSize: '2rem', marginBottom: '15px' }}>{modal.title}</h3>
                            <p className="modal-desc" style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px' }}>{modal.description}</p>
                            
                            {modal.collectible && (
                                <div className="collectible-notice" style={{ marginBottom: '30px' }}>
                                    <span className="metadata-label" style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '4px 12px', borderRadius: '2px' }}>Personalized Profile Update Pending</span>
                                </div>
                            )}

                            <div className="modal-actions" style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={handleAddToBackpackClick} className="ghost-button" style={{ padding: '12px 30px', background: 'rgba(255,255,255,0.1)' }}>
                                    {modal.type === 'medal' ? 'Log Interest' : 'Capture Asset'}
                                </button>
                                <button onClick={handleCloseModal} className="ghost-button" style={{ padding: '12px 30px' }}>Dismiss</button>
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
                }} className="ghost-button" style={{ padding: '12px 40px', background: 'rgba(255,255,255,0.05)' }}>NEXT EXPERIENCE &rarr;</button>
            </div>

            {/* Direct Lead Trigger (Toast Notification) */}
            {activeLiveOffer && (
                <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10000,
                    padding: '1px' // For the thin border effect
                }} className="animate-fade-in">
                    <div className="glass-panel" style={{
                        padding: '15px 30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        borderRadius: '2px', // Leica Hard Edge
                        border: '0.5px solid rgba(255, 255, 255, 0.3)',
                    }}>
                        <div style={{ fontSize: '1.5rem' }}>{activeLiveOffer.icon}</div>
                        <div>
                            <div className="metadata-label" style={{ fontSize: '0.6rem', marginBottom: '4px', color: 'var(--color-accent-primary)' }}>Direct Lead Capture</div>
                            <div className="serif-title" style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                                Profile Updated: {activeLiveOffer.baseTitle} Logged.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExperiencePage;
