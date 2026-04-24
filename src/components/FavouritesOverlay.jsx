import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';

const YouTubePlayer = ({ url }) => {
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
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <video src={url} controls playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
        );
    }

    const videoId = getYouTubeId(url)?.trim();
    if (!videoId) return null;

    return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '177.77%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
            <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

const FavouritesOverlay = ({ isVisible, onClose }) => {
    const { interestInsights, backpack, travelStatus } = useGame();
    const { publicConfig, manifest } = useInfluencer();
    const [selectedItem, setSelectedItem] = React.useState(null);
    const currentThemeColor = manifest?.client_metadata?.brand_assets?.primary_color || '#00e5ff';

    const overlaySpring = useSpring({
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        config: { tension: 120, friction: 14 }
    });

    const panelSpring = useSpring({
        transform: isVisible ? 'translateX(0%)' : 'translateX(100%)',
        config: { tension: 200, friction: 25 }
    });

    const detailSpring = useSpring({
        opacity: selectedItem ? 1 : 0,
        transform: selectedItem ? 'translateX(0%)' : 'translateX(50%)',
        pointerEvents: selectedItem ? 'auto' : 'none'
    });

    const vibeCategories = [
        { id: 'Wellness Voyager', title: 'Wellness Voyager' },
        { id: 'Culture Seeker', title: 'Culture Seeker' },
        { id: 'Family Planner', title: 'Family Planner' },
        { id: 'Work from Sea', title: 'Work from Sea' },
        { id: 'Social Foodie', title: 'Social Foodie' },
        { id: 'The Alchemist', title: 'The Alchemist' },
        { id: 'Social Storyteller', title: 'Social Storyteller' },
        { id: 'The Sovereign', title: 'The Sovereign' },
    ];

    return (
        <animated.div className="favourites-overlay" style={{
            ...overlaySpring,
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(5, 5, 15, 0.8)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            justifyContent: 'flex-end'
        }} onClick={() => { setSelectedItem(null); onClose(); }}>
            <animated.div 
                className="favourites-panel glass-panel" 
                style={{
                    ...panelSpring,
                    width: '100%',
                    maxWidth: '500px',
                    height: '100%',
                    background: 'rgba(10, 10, 25, 0.98)',
                    backdropFilter: 'blur(40px)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* List View */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="favourites-header" style={{ padding: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="serif-title" style={{ margin: 0, fontSize: '1.8rem' }}>{(publicConfig?.teleport?.backpackTitle || "My Discoveries").toUpperCase()}</h2>
                            <p className="metadata-label" style={{ margin: '5px 0 0 0', opacity: 0.6 }}>{(publicConfig?.teleport?.backpackDesc || "Your Curated Experience")}</p>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div className="favourites-scroll" style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                        {/* Vibe Insight */}
                        <div style={{ marginBottom: '40px' }}>
                            <div className="metadata-label" style={{ color: currentThemeColor, marginBottom: '20px', fontSize: '0.65rem', letterSpacing: '4px' }}>EXPERIENCE PROFILE</div>
                            <div className="vibe-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {vibeCategories.map(vibe => {
                                    const score = interestInsights ? (interestInsights[vibe.id] || 0) : 0;
                                    const isActive = score > 0;
                                    return (
                                        <div key={vibe.id} style={{ 
                                            background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                            border: isActive ? `1px solid ${currentThemeColor}60` : '1px solid rgba(255,255,255,0.05)',
                                            padding: '10px 5px',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            opacity: isActive ? 1 : 0.4
                                        }}>
                                            <div style={{ fontSize: '0.55rem', fontWeight: '800', textTransform: 'uppercase' }}>{vibe.title.split(' ')[0]}</div>
                                            {isActive && <div style={{ fontSize: '0.65rem', color: currentThemeColor, marginTop: '3px', fontWeight: '900' }}>{score}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="metadata-label" style={{ color: currentThemeColor, marginBottom: '20px', fontSize: '0.65rem', letterSpacing: '4px' }}>CAPTURED ASSETS ({backpack.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {backpack.map((item, idx) => (
                                <div key={idx} onClick={() => setSelectedItem(item)} style={{ 
                                    display: 'flex', gap: '20px', padding: '15px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                    <div style={{ width: '60px', height: '60px', background: `${currentThemeColor}20`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {item.type === 'medal' ? '🏅' : '🎒'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                                    </div>
                                    <div style={{ color: currentThemeColor, fontSize: '1.2rem' }}>→</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detail View (Sub-panel) */}
                <animated.div style={{
                    ...detailSpring,
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(10, 10, 30, 1)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px'
                }}>
                    <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: currentThemeColor, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', fontWeight: '800' }}>
                        ← BACK TO COLLECTION
                    </button>

                    {selectedItem && (
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <div style={{ marginBottom: '30px' }}>
                                {selectedItem.video ? (
                                    <YouTubePlayer url={selectedItem.video} />
                                ) : (
                                    <img src={selectedItem.media || selectedItem.image || '/assets/hero.png'} style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} alt="Detail" />
                                )}
                            </div>
                            
                            <div className="metadata-label" style={{ color: currentThemeColor, fontSize: '0.6rem', letterSpacing: '4px', marginBottom: '10px' }}>DISCOVERY DETAIL</div>
                            <h2 className="serif-title" style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '20px', lineHeight: 1.1 }}>{selectedItem.title}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '40px' }}>{selectedItem.description}</p>

                            {selectedItem.collectible?.url && (
                                <div style={{ padding: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="metadata-label" style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '15px' }}>COLLECTIBLE REWARD</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                                        <div style={{ fontSize: '2rem' }}>{selectedItem.type === 'medal' ? '🏅' : '📄'}</div>
                                        <div style={{ flex: 1, fontWeight: '800', color: '#fff' }}>{selectedItem.collectible.title || 'Discovery Asset'}</div>
                                    </div>
                                    <button 
                                        onClick={() => window.open(selectedItem.collectible.url, '_blank')}
                                        style={{ width: '100%', padding: '15px', borderRadius: '10px', background: currentThemeColor, color: '#000', border: 'none', fontWeight: '900', cursor: 'pointer' }}
                                    >
                                        ACCESS COLLECTIBLE
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </animated.div>
            </animated.div>
        </animated.div>
    );
};

export default FavouritesOverlay;

