import React from 'react';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';

const FavouritesOverlay = ({ onClose }) => {
    const { interestInsights, influencer, backpack, favourites, toggleFavourite, travelStatus, resetProgress } = useGame();
    const { publicConfig, publicInfluencer } = useInfluencer();
    const brandingTitle = publicConfig?.home?.title?.toUpperCase() || "VIRTUAL EXPERIENCE";

    React.useEffect(() => {
        console.log('%c[FavouritesOverlay] Rendering with backpack items:', 'color: #ff00ff; font-weight: bold;', backpack);
        backpack.forEach((item, idx) => {
            console.log(`  [${idx}] ${item.title}:`, {
                id: item.id,
                type: item.type,
                hasImage: !!item.image,
                image: item.image
            });
        });
    }, [backpack]);

    const vibeCategories = [
        { id: 'Wellness Voyager', title: 'Wellness Voyager', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=150&q=80' },
        { id: 'Culture Seeker', title: 'Culture Seeker', image: 'https://images.unsplash.com/photo-1518911710364-17ec553bde5d?auto=format&fit=crop&w=150&q=80' },
        { id: 'Family Planner', title: 'Family Planner', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=150&q=80' },
        { id: 'Work from Sea', title: 'Work from Sea', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80' },
        { id: 'Social Foodie', title: 'Social Foodie', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=150&q=80' },
        { id: 'The Alchemist', title: 'The Alchemist', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=150&q=80' },
        { id: 'Social Storyteller', title: 'Social Storyteller', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80' },
        { id: 'The Sovereign', title: 'The Sovereign', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=150&q=80' },
    ];

    return (
        <div className="favourites-overlay">
            <div className="favourites-panel glass-panel animate-fade-in">
                <div className="favourites-header">
                    <div>
                        <h2 className="panel-title" style={{ margin: 0 }}>{(publicConfig?.teleport?.backpackTitle || "FAVOURITES & BACKPACK").toUpperCase()}</h2>
                        <p className="panel-subtitle" style={{ margin: 0 }}>{(publicConfig?.teleport?.backpackDesc || "CURATED FOR YOUR NEXT VOYAGE").toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="favourites-scroll">
                    {/* Vibe Grid */}
                    <h3 className="panel-subtitle" style={{ color: '#FFD700', marginBottom: '1rem' }}>YOUR VIBE PROFILE</h3>
                    <div className="vibe-grid">
                        {vibeCategories.map(vibe => {
                            const score = interestInsights ? (interestInsights[vibe.id] || 0) : 0;
                            const isActive = score > 0;
                            return (
                                <div key={vibe.id} className={`vibe-card ${isActive ? 'active' : ''}`}>
                                    <div style={{ color: isActive ? '#FFD700' : '#444', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        {isActive ? '★' : '☆'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginTop: '5px' }}>{vibe.title.toUpperCase()}</div>
                                    <img src={vibe.image} className="vibe-card-img" style={{ opacity: isActive ? 1 : 0.2 }} alt={vibe.title} />
                                    {isActive && <div style={{ fontSize: '0.6rem', color: '#FFD700', marginTop: '5px' }}>{score} PTS</div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Backpack Items */}
                    <h3 className="panel-subtitle" style={{ color: '#FFD700', marginBottom: '1.5rem' }}>BACKPACK ITEMS ({backpack.length})</h3>
                    <div className="curated-feed">
                        {backpack.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>Your backpack is empty. Explore and find activities!</p>
                        ) : (
                            backpack.map((item, idx) => {
                                const roomId = String(item.id || '1').split('-')[0];
                                const themes = { '1': '#d4af37', '2': '#00e5ff', '3': '#ff8c00', '4': '#ff3d00', '5': '#ffcc00' };
                                const itemColor = item.type === 'medal' ? '#FFD700' : (themes[roomId] || '#d4af37');

                                return (
                                <div key={idx} className="feed-item" style={{ borderLeft: `4px solid ${itemColor}`, background: `rgba(255,255,255,0.02)` }}>
                                    <div className="feed-img">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: `${itemColor}20`,
                                            display: item.image ? 'none' : 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            border: `1px solid ${itemColor}40`
                                        }}>
                                            {item.type === 'medal' ? '🏅' : (item.icon || '🎒')}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ margin: '0 0 5px 0', color: itemColor, fontSize: '0.9rem', fontWeight: '800' }}>{item.title.toUpperCase()}</h4>
                                            {item.collectible && (
                                                <span style={{ 
                                                    fontSize: '0.5rem', 
                                                    background: `${itemColor}20`, 
                                                    color: itemColor, 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px',
                                                    border: `1px solid ${itemColor}40`,
                                                    fontWeight: 'bold',
                                                    letterSpacing: '1px'
                                                }}>
                                                    COLLECTIBLE
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>{item.description}</p>
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>

                    {/* Voyage Details */}
                    <div className="voyage-details-section glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <h3 className="panel-subtitle" style={{ color: '#FFD700', marginBottom: '1rem', marginTop: 0 }}>YOUR VOYAGE DETAILS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>FIRST TIME CRUISER</span>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    color: travelStatus.hasFirstTimeBadge ? '#FFD700' : '#888',
                                    background: travelStatus.hasFirstTimeBadge ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    padding: '4px 12px',
                                    borderRadius: '20px'
                                }}>
                                    {travelStatus.hasFirstTimeBadge ? 'CLAIMED' : 'UNCLAIMED'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>SPECIAL OCCASION PACKAGE</span>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    color: travelStatus.hasSpecialOccasionBadge ? '#ff69b4' : '#888',
                                    background: travelStatus.hasSpecialOccasionBadge ? 'rgba(255, 105, 180, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    padding: '4px 12px',
                                    borderRadius: '20px'
                                }}>
                                    {travelStatus.hasSpecialOccasionBadge ? 'CLAIMED' : 'UNCLAIMED'}
                                </span>
                            </div>

                            {travelStatus.bookingDates && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>SAILING DATE</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{travelStatus.bookingDates}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Influencer Advice */}
                    <div className="influencer-section glass-panel">
                        <div className="influencer-avatar">
                            <img src={publicConfig?.home?.influencerPhoto || influencer?.image} alt={publicInfluencer?.name || influencer?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h4 style={{ color: '#FFD700' }}>{(publicInfluencer?.name || influencer?.name).toUpperCase()}'S ADVICE</h4>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, maxWidth: '500px' }}>
                            {publicConfig?.home?.description ? (
                                `"${publicConfig.home.description.substring(0, 150)}..."`
                            ) : (
                                `"Yo! You're building a sick profile here. These spots are my absolute favorites. Keep exploring!"`
                            )}
                        </p>
                    </div>

                    {/* Reset Progress Button */}
                    <div style={{ marginTop: '3rem', padding: '1rem', textAlign: 'center' }}>
                        <button 
                            onClick={() => {
                                if (window.confirm("Are you sure you want to restart your voyage? This will clear your backpack and profile.")) {
                                    resetProgress();
                                    onClose();
                                }
                            }}
                            className="btn-glass"
                            style={{ 
                                color: '#ff4444', 
                                borderColor: 'rgba(255, 68, 68, 0.3)',
                                fontSize: '0.8rem',
                                padding: '10px 20px'
                            }}
                        >
                            RESTART VOYAGE (CLEAR PROGRESS)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FavouritesOverlay;
