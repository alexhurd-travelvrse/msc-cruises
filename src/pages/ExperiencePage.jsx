import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ExperienceCanvas from '../components/ExperienceCanvas';
import ExperienceLoader from '../components/ExperienceLoader';
import MedalAwardOverlay from '../components/MedalAwardOverlay';
import FavouritesOverlay from '../components/FavouritesOverlay';
import { AeroGlassOrb } from '../components/AeroGlassOrb';
import { InputManager } from '../components/InputManager';
import Joystick from '../components/Joystick';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';
import SceneEditor from '../components/SceneEditor';
import AudioController from '../components/AudioController';
import ChallengeSystem from '../components/ChallengeSystem';

const YouTubePlayer = ({ url, previewImage }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isRawVideo = (url) => {
        if (!url) return false;
        return url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes('v.ftcdn.net');
    };

    if (!url) return null;

    if (isRawVideo(url)) {
        return (
            <div className="video-container" style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <video 
                    src={url} 
                    controls 
                    playsInline
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>
        );
    }

    const videoId = getYouTubeId(url)?.trim();
    
    if (!videoId) return (
        <div style={{ width: '100%', height: '150px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Video preview unavailable</span>
        </div>
    );

    if (!isLoaded && previewImage) {
        return (
            <div className="video-container" 
                onClick={() => setIsLoaded(true)}
                style={{ 
                    position: 'relative', 
                    width: '100%', 
                    paddingBottom: '56.25%', 
                    height: 0, 
                    background: '#000', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    cursor: 'pointer'
                }}>
                <img src={previewImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', background: 'rgba(0,229,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
                    <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid white', marginLeft: '5px' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="video-container" style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe 
                key={videoId}
                title="YouTube video player"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
            />
        </div>
    );
};

const ExperiencePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateChallenge, addToBackpack, backpack, challenges, itemsViewed, setItemsViewed, dismissItem, getTopInterest, getTotalCoins } = useGame();
    const { publicConfig, publicInfluencer, manifest } = useInfluencer();
    
    const location = useLocation();
    const [isMobile] = useState(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const queryParams = new URLSearchParams(location.search);
    const showEditor = queryParams.get('editor') === 'true';

    const [lastId, setLastId] = useState(id);
    const [modal, setModal] = useState(null);
    const [medalAward, setMedalAward] = useState(null);
    const [showFavourites, setShowFavourites] = useState(false);
    const [backpackUpdated, setBackpackUpdated] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isSplatLoaded, setIsSplatLoaded] = useState(false);
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [activeEditorObject, setActiveEditorObject] = useState(null);
    const [activeLiveOffer, setActiveLiveOffer] = useState(null);
    const [editorObjects, setEditorObjects] = useState([]);

    const activeExp = publicConfig?.experiences?.[id];
    const propertyName = publicConfig?.home?.propertyName?.toUpperCase() || "25 HOURS HOTEL";
    const brandingTitle = publicConfig?.home?.title?.toUpperCase() || "VIRTUAL EXPERIENCE";
    const currentThemeColor = manifest?.client_metadata?.brand_assets?.primary_color || '#00e5ff';

    useEffect(() => {
        const roomConfig = publicConfig?.experiences?.[id];
        if (roomConfig) {
            const rawItems = roomConfig.backpack_icons || roomConfig.items || [];
            const mapped = rawItems.map(item => ({
                id: item.id,
                name: item.name || item.reward_label || `Item ${item.id}`,
                pos: item.coordinates ? [item.coordinates.x, item.coordinates.y, item.coordinates.z] : (item.position || [0,0,0]),
                rot: item.rotation || [0,0,0],
                discoveryMode: item.discoveryMode || 'instant'
            }));

            const cameraObj = {
                id: 'camera',
                name: 'Camera Start Position',
                pos: roomConfig.startPos || [0, 2, 5],
                rot: roomConfig.startRot || [0, 0, 0],
                isPersistent: true
            };

            setEditorObjects([...mapped, cameraObj]);
        }
    }, [id, publicConfig]);

    useEffect(() => {
        const handleManualSync = (e) => {
            const { id: objId, pos, rot, discoveryMode, audioUrl } = e.detail;
            setEditorObjects(prev => prev.map(obj => {
                if (obj.id === objId) {
                    return {
                        ...obj,
                        ...(pos && { pos }),
                        ...(rot && { rot }),
                        ...(discoveryMode && { discoveryMode }),
                        ...(audioUrl && { audioUrl })
                    };
                }
                return obj;
            }));
        };
        window.addEventListener('scene-editor-manual-sync', handleManualSync);
        return () => window.removeEventListener('scene-editor-manual-sync', handleManualSync);
    }, []);

    if (id !== lastId) {
        setIsStarted(false);
        setIsSplatLoaded(false);
        setModal(null);
        setLastId(id);
    }

    useEffect(() => {
        const handleSplatLoaded = () => {
            setIsSplatLoaded(true);
            setIsStarted(true);
        };
        window.addEventListener('msc-splat-loaded', handleSplatLoaded);
        return () => window.removeEventListener('msc-splat-loaded', handleSplatLoaded);
    }, []);

    useEffect(() => {
        const handleObjectClicked = (e) => {
            const { experienceId: expId, itemIndex } = e.detail;
            const exp = publicConfig?.experiences?.[expId];
            const items = exp?.backpack_icons || exp?.items || [];
            const item = items[itemIndex];

            if (item) {
                const itemData = {
                    id: item.id,
                    title: item.name || item.reward_label || 'Discovery Found',
                    description: item.description || 'You have found a new item.',
                    media: item.media || item.image,
                    video: item.video,
                    type: item.content_type === 'collectible' ? 'medal' : 'activity',
                    collectible: item.collectible
                };

                if (itemData.type === 'medal') {
                    setMedalAward(itemData);
                } else {
                    setModal(itemData);
                }
            }
        };

        window.addEventListener('object-clicked', handleObjectClicked);
        return () => window.removeEventListener('object-clicked', handleObjectClicked);
    }, [id, publicConfig]);

    const handleCloseModal = () => {
        if (modal && modal.id) {
            setItemsViewed(prev => [...new Set([...prev, modal.id])]);
            dismissItem(modal.id);
        }
        setModal(null);
    };

    const handleCaptureMedal = () => {
        if (medalAward) {
            addToBackpack(medalAward);
            setBackpackUpdated(true);
            setTimeout(() => setBackpackUpdated(false), 2000);
            setActiveLiveOffer({ baseTitle: medalAward.title, icon: '🎒' });
            setTimeout(() => setActiveLiveOffer(null), 3000);
            setMedalAward(null);
        }
    };

    const handleAddToBackpackClick = () => {
        if (modal) {
            addToBackpack(modal);
            setBackpackUpdated(true);
            setTimeout(() => setBackpackUpdated(false), 2000);
            setActiveLiveOffer({ baseTitle: modal.title, icon: '🎒' });
            setTimeout(() => setActiveLiveOffer(null), 3000);
            handleCloseModal();

            const experienceIds = Object.keys(publicConfig.experiences || {});
            const currentIndex = experienceIds.indexOf(id);
            if (currentIndex !== -1 && currentIndex < experienceIds.length - 1) {
                const nextId = experienceIds[currentIndex + 1];
                setTimeout(() => navigate(`/experience/${nextId}`), 2000);
            } else {
                setTimeout(() => navigate('/completion'), 2000);
            }
        }
    };



    return (
        <div className="experience-container" style={{ touchAction: 'none' }}>
            {!isSplatLoaded && <ExperienceLoader isVisible={true} isSplatLoaded={false} />}
            <InputManager />
            {/* Orb is now integrated into the bottom-right cluster */}

            {isStarted && isMobile && <Joystick color={currentThemeColor} />}

            <div className="experience-canvas-layer">
                <ExperienceCanvas 
                    experienceId={id} 
                    isInteractionActive={showFavourites || !!modal || !!medalAward || isEditorMode} 
                    isEditorMode={isEditorMode}
                    activeEditorObject={activeEditorObject}
                    isStarted={isStarted} 
                    isItemsAllowed={true}
                    itemsViewed={itemsViewed} 
                    isModalOpen={!!modal || showFavourites || !!medalAward}
                />
            </div>

            <div className="hud-overlay" style={{ pointerEvents: 'none' }}>
                {/* TOP LEFT: MINIMAL BRAND PILL */}
                <div style={{ position: 'fixed', top: '30px', left: '30px', zIndex: 9005, pointerEvents: 'auto' }}>
                    <div className="glass-panel" onClick={() => navigate('/')} style={{ 
                        padding: '10px 24px', 
                        borderRadius: '50px', 
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <span className="metadata-label" style={{ color: '#fff', fontSize: '0.7rem', letterSpacing: '3px' }}>
                            {propertyName}
                        </span>
                    </div>
                </div>

                {/* TOP RIGHT: HOME BUTTON (90px) */}
                <div style={{ position: 'fixed', top: '30px', right: '30px', zIndex: 9005, pointerEvents: 'auto' }}>
                    <div className="glass-btn-circle" onClick={() => navigate('/')} style={{ 
                        width: '90px', 
                        height: '90px', 
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span className="metadata-label" style={{ fontSize: '0.6rem', color: '#fff', opacity: 0.8 }}>HOME</span>
                    </div>
                </div>

                {/* TOP MIDDLE: VIBE SECTOR (RESTORED) */}
                <div style={{ 
                    position: 'fixed', 
                    top: '30px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    zIndex: 9005, 
                    pointerEvents: 'auto',
                    textAlign: 'center'
                }}>
                    <div className="glass-panel" style={{ 
                        padding: '15px 50px', 
                        minWidth: '350px',
                        borderRadius: '0 0 20px 20px',
                        borderBottom: `4px solid ${currentThemeColor}`,
                        background: 'rgba(5, 5, 20, 0.6)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div className="metadata-label" style={{ opacity: 0.6, fontSize: '0.65rem', letterSpacing: '4px' }}>VIBE SECTOR</div>
                        <div className="serif-title" style={{ fontSize: '2rem', color: '#fff', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {getTopInterest?.() || 'EXPLORING'}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: OVERSIZED UTILITY DOCK (90px - 40% LARGER) */}
                <div style={{ 
                    position: 'fixed', 
                    right: '40px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    zIndex: 9010, 
                    pointerEvents: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                }}>
                    {/* Medal Icon (90px) */}
                    <div className="glass-btn-circle" style={{ width: '90px', height: '90px', border: '2px solid rgba(255, 215, 0, 0.4)', cursor: 'pointer' }} onClick={() => setShowFavourites(true)}>
                        <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }}>🏅</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontWeight: '900', color: '#FFD700', fontSize: '1rem' }}>{getTotalCoins()}</span>
                        </div>
                    </div>

                    {/* Backpack Icon (90px) */}
                    <div className={`glass-btn-circle ${backpackUpdated ? 'backpack-glow' : ''}`} 
                        onClick={() => setShowFavourites(true)} 
                        style={{ width: '90px', height: '90px', border: `2px solid ${currentThemeColor}`, cursor: 'pointer' }}>
                        <span style={{ fontSize: '2.2rem' }}>🎒</span>
                        <span style={{ fontWeight: '900', color: '#fff', fontSize: '1rem' }}>{backpack.length}</span>
                    </div>

                    {/* Re-centre Icon (90px) */}
                    <div className="glass-btn-circle" onClick={() => window.dispatchEvent(new CustomEvent('force-camera-reset'))} style={{ width: '90px', height: '90px', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="22" y1="12" x2="18" y2="12"></line>
                            <line x1="6" y1="12" x2="2" y2="12"></line>
                            <line x1="12" y1="6" x2="12" y2="2"></line>
                            <line x1="12" y1="22" x2="12" y2="18"></line>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>
                </div>

                {/* MID LEFT: RESTORED ORB */}
                <div style={{ 
                    position: 'fixed', 
                    top: '50%', 
                    left: '40px', 
                    transform: 'translateY(-50%)', 
                    zIndex: 9010, 
                    pointerEvents: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div className="glass-btn-circle" style={{ width: '90px', height: '90px', border: `2px solid ${currentThemeColor}`, padding: '4px', background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                        <img src={publicInfluencer?.avatar || '/assets/avatar.jpg'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="Guide" />
                    </div>
                    <div className="metadata-label" style={{ color: '#fff', fontSize: '0.65rem', textAlign: 'center', opacity: 0.8, letterSpacing: '2px', fontWeight: '800' }}>
                        {publicInfluencer?.name?.toUpperCase() || 'GUIDE'}
                    </div>
                </div>

                {/* BOTTOM RIGHT: STANDALONE NEXT CHALLENGE */}
                <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9010, pointerEvents: 'auto' }}>
                    {(challenges[id]?.coinFound || backpack.filter(i => i.experienceId === id).length >= 1) && (
                        <button 
                            onClick={() => {
                                const experienceIds = Object.keys(publicConfig.experiences || {});
                                const currentIndex = experienceIds.indexOf(id);
                                if (currentIndex !== -1 && currentIndex < experienceIds.length - 1) {
                                    navigate(`/experience/${experienceIds[currentIndex + 1]}`);
                                } else {
                                    navigate('/completion');
                                }
                            }}
                            className="glass-panel"
                            style={{
                                padding: '20px 45px',
                                borderRadius: '50px',
                                border: `2px solid ${currentThemeColor}`,
                                background: `${currentThemeColor}20`,
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                boxShadow: `0 0 30px ${currentThemeColor}40`
                            }}
                        >
                            <span className="metadata-label" style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '2px' }}>NEXT EXPERIENCE</span>
                            <span style={{ fontSize: '1.6rem', fontWeight: '900' }}>→</span>
                        </button>
                    )}
                </div>

                <ChallengeSystem experienceId={id} />
            </div>

            {modal && (
                <div className="modal-overlay" onClick={handleCloseModal} style={{ zIndex: 100000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                    <div className="discovery-modal glass-panel animate-fade-in" onClick={(e) => e.stopPropagation()} style={{
                        maxWidth: '550px',
                        width: '90%',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        padding: '0',
                        borderRadius: '24px',
                        background: 'rgba(15, 15, 35, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
                    }}>
                        {/* Modal Header Accent */}
                        <div style={{ height: '4px', width: '100%', background: `linear-gradient(90deg, transparent, ${currentThemeColor}, transparent)` }}></div>
                        
                        {/* Media Section */}
                        <div className="modal-media" style={{ width: '100%', minHeight: '200px' }}>
                            {modal.video ? (
                                <YouTubePlayer url={modal.video} previewImage={modal.media} />
                            ) : (
                                <img src={modal.media || '/assets/hero.png'} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Discovery" />
                            )}
                        </div>

                        {/* Content Section */}
                        <div style={{ padding: '35px' }}>
                            <div className="metadata-label" style={{ color: currentThemeColor, letterSpacing: '4px', fontSize: '0.65rem', marginBottom: '10px' }}>NEW DISCOVERY FOUND</div>
                            <h2 className="serif-title" style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '20px', lineHeight: 1.1 }}>{modal.title}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '30px' }}>
                                {modal.description}
                            </p>

                            {/* Collectible Preview Card */}
                            <div className="collectible-card" style={{ 
                                padding: '20px', 
                                background: 'rgba(255,255,255,0.05)', 
                                borderRadius: '12px', 
                                border: '1px dashed rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                marginBottom: '35px'
                            }}>
                                <div style={{ fontSize: '2.5rem' }}>
                                    {modal.collectible?.type === 'mp3' || modal.collectible?.type === 'medal' ? '🎵' : '📄'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="metadata-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>COLLECTIBLE REWARD</div>
                                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '0.9rem' }}>
                                        {modal.collectible?.title || 'Discovery Asset'}
                                    </div>
                                </div>
                                <div style={{ color: currentThemeColor, fontWeight: '900', fontSize: '0.7rem' }}>LOCKED</div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <button 
                                    onClick={handleAddToBackpackClick}
                                    style={{
                                        width: '100%',
                                        padding: '18px',
                                        borderRadius: '12px',
                                        background: currentThemeColor,
                                        color: '#000',
                                        border: 'none',
                                        fontWeight: '900',
                                        fontSize: '0.9rem',
                                        letterSpacing: '2px',
                                        cursor: 'pointer',
                                        boxShadow: `0 10px 20px ${currentThemeColor}40`,
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    CAPTURE TO BACKPACK
                                </button>
                                <button 
                                    onClick={handleCloseModal}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        color: 'rgba(255,255,255,0.5)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    NOT NOW
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FavouritesOverlay isVisible={showFavourites} onClose={() => setShowFavourites(false)} />
            <MedalAwardOverlay 
                isVisible={!!medalAward} 
                medalTitle={medalAward?.title} 
                onClose={handleCaptureMedal} 
            />

            {activeLiveOffer && (
                <div className="glass-panel" style={{ 
                    position: 'fixed', 
                    bottom: '40px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    zIndex: 10000, 
                    padding: '15px 30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    border: `1px solid ${currentThemeColor}`
                }}>
                    <span style={{ fontSize: '2rem' }}>🎒</span>
                    <div className="serif-title" style={{ fontSize: '1.1rem' }}>Captured: {activeLiveOffer.baseTitle}</div>
                </div>
            )}

            {showEditor && (
                <SceneEditor 
                    isEditorMode={isEditorMode}
                    setIsEditorMode={setIsEditorMode}
                    activeObject={activeEditorObject}
                    setActiveObject={setActiveEditorObject}
                    objects={editorObjects}
                    onSaveToContext={async (objs) => {
                        console.log("Local sync complete", objs);
                        return { success: true };
                    }}
                />
            )}
        </div>
    );
};

export default ExperiencePage;
