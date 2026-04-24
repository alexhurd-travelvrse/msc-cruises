import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';
import AudioController from '../components/AudioController';
import DigitalGuideOverlay from '../components/DigitalGuideOverlay';

const CompletionPage = () => {
    const { backpack, travelStatus, getTopInterest } = useGame();
    const { publicConfig, manifest, publicInfluencer } = useInfluencer();

    React.useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const topTag = getTopInterest();
    const rewardEngine = manifest?.reward_engine || {};
    
    const matchedProfile = useMemo(() => {
        if (!rewardEngine.data_profiles) return null;
        return rewardEngine.data_profiles.find(p => p.match_tags.includes(topTag)) || rewardEngine.data_profiles[0];
    }, [rewardEngine, topTag]);

    const heroImage = publicConfig?.home?.heroImage || '/assets/hero.png';
    const primaryColor = manifest?.client_metadata?.brand_assets?.primary_color || '#00e5ff';

    return (
        <div className="completion-page" style={{
            backgroundImage: `url(${heroImage})`,
            minHeight: '100vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            color: 'white',
            padding: '80px 20px 40px',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            <div className="completion-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(5, 5, 20, 0.5) 0%, rgba(5, 5, 20, 0.95) 100%)',
                zIndex: 1
            }}></div>

            {/* PARTNER LOGO */}
            {publicConfig.home?.partnerLogo && (
                <div style={{
                    position: 'fixed',
                    top: '40px',
                    left: '40px',
                    zIndex: 100,
                    pointerEvents: 'none'
                }}>
                    <img 
                        src={publicConfig.home.partnerLogo} 
                        alt="Partner Logo" 
                        style={{ height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))' }} 
                    />
                </div>
            )}

            <DigitalGuideOverlay 
                avatarUrl={publicInfluencer?.avatar || '/assets/avatar.jpg'} 
                name={`${publicInfluencer?.name || 'Guide'} - Digital Guide`}
                isVisible={true}
                positionStyle={{ bottom: '40px', right: '40px' }}
            />

            <AudioController audioKey="completion" active={true} />

            <div className="completion-content animate-fade-in" style={{ position: 'relative', zIndex: 10, maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                <p style={{
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    color: primaryColor,
                    fontWeight: '700',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    {rewardEngine.reward_title || 'CHALLENGE COMPLETE'}
                </p>

                <div className="speakeasy-card-container" style={{ perspective: '1000px', marginBottom: '20px' }}>
                    <div className="membership-card glass-panel" style={{
                        width: '100%',
                        maxWidth: '560px',
                        margin: '0 auto',
                        padding: '20px',
                        borderRadius: '24px',
                        background: 'rgba(5, 5, 20, 0.92)',
                        border: `3px solid ${primaryColor}`,
                        boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 30px ${primaryColor}40`,
                        textAlign: 'left',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <div>
                                <h4 style={{ color: primaryColor, letterSpacing: '3px', fontSize: '0.7rem', margin: '0 0 4px 0', fontWeight: '800' }}>MEMBERSHIP ACCESS</h4>
                                <h2 style={{ fontSize: '1.6rem', margin: '0', color: 'white', fontWeight: '800', lineHeight: 1.1 }}>{manifest?.client_metadata?.hotel_name}</h2>
                            </div>
                            <img src={manifest?.client_metadata?.brand_assets?.hotel_logo_url} style={{ height: '50px', flexShrink: 0 }} />
                        </div>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', marginBottom: '20px' }}>
                            {rewardEngine.qr_code_enabled && (
                                <div style={{
                                    background: 'white',
                                    borderRadius: '14px',
                                    padding: '12px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    border: `3px solid ${primaryColor}`,
                                    boxShadow: `0 0 25px ${primaryColor}50`,
                                }}>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(rewardEngine.reward_url || 'https://travelvrse.com')}`}
                                        alt="Redeem QR"
                                        style={{ width: '120px', height: '120px', display: 'block' }}
                                    />
                                    <div style={{ color: '#050510', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1.5px', textAlign: 'center' }}>SCAN TO REDEEM</div>
                                </div>
                            )}

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', display: 'block', letterSpacing: '1.5px', fontWeight: '800', marginBottom: '2px' }}>STATUS PROFILE</label>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: primaryColor }}>{matchedProfile?.profile_name?.toUpperCase() || 'EXPLORER'}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', display: 'block', letterSpacing: '1.5px', fontWeight: '800', marginBottom: '2px' }}>CHARTED BY</label>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>{publicInfluencer?.name?.toUpperCase()}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '18px 20px',
                            background: `${primaryColor}12`,
                            borderRadius: '14px',
                            border: `1px solid ${primaryColor}50`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: `${primaryColor}18`, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${primaryColor}30` }}>
                                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💎</span>
                                <div>
                                    <span style={{ color: primaryColor, fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Exclusive Offer</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>{matchedProfile?.offer_text || 'Unlock your discovery perk.'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginBottom: '35px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => window.open(rewardEngine.reward_url, '_blank')}
                        style={{
                            flex: 1,
                            minWidth: '180px',
                            padding: '18px 28px',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: '900',
                            letterSpacing: '2px',
                            background: primaryColor,
                            color: '#050510',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        CLAIM NOW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompletionPage;
