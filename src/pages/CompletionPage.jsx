import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';
import AudioController from '../components/AudioController';
import DigitalGuideOverlay from '../components/DigitalGuideOverlay';

const CompletionPage = () => {
    const { backpack, travelStatus, influencer, logoutInfluencer, getTopInterest } = useGame();
    const { publicConfig } = useInfluencer();

    // Ensure we start at the top so the QR code is first thing visible
    React.useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const topPersona = getTopInterest();
    const heroImage = publicConfig?.home?.heroImage || '/assets/speakeasy_hero.png';
    
    const personaDetails = {
        'The Sovereign': {
            title: 'The Sovereign',
            desc: 'You prioritize exclusivity and world-class service. Your ideal cruise involves private suites and elite access.',
            offer: 'Enjoy a complimentary Yacht Club Upgrade on your next booking.',
            color: '#D4AF37' // Gold
        },
        'Wellness Voyager': {
            title: 'Wellness Voyager',
            desc: 'You seek rejuvenation and balance. The Aurea Spa is your sanctuary at sea.',
            offer: 'Receive a free 60-minute Balinese massage on your first day.',
            color: '#5BC0DE' // Aqua
        },
        'Social Foodie': {
            title: 'Social Foodie',
            desc: 'Authentic flavors and vibrant social dining are your passion.',
            offer: 'Unlock a complimentary specialty dining experience for two.',
            color: '#FF7E5F' // Sunset Coral
        },
        'Family Planner': {
            title: 'Family Planner',
            desc: 'Creating multi-generational memories is your mission.',
            offer: 'Kids sail free + unlimited arcade passes included.',
            color: '#2C6E80' // Deep Sea
        },
        'The Alchemist': {
            title: 'The Alchemist',
            desc: 'You search for hidden gems and sophisticated, transformative moments.',
            offer: 'Private mixology class and Speakeasy priority access.',
            color: '#9B59B6' // Purple
        },
        'Culture Seeker': {
            title: 'Culture Seeker',
            desc: 'You are driven by discovery and local immersion.',
            offer: 'One complimentary shore excursion of your choice.',
            color: '#00BCD4' // Teal
        },
        'Work from Sea': {
            title: 'Work from Sea',
            desc: 'Efficiency meets adventure. You value connectivity and modern luxury.',
            offer: 'Complimentary high-speed Starlink Wi-Fi for your entire voyage.',
            color: '#34495E' // Slate
        },
        'Social Storyteller': {
            title: 'Social Storyteller',
            desc: 'You capture the beauty of the world. Aesthetics are your northern star.',
            offer: 'Private photography session at sunset in the Promenade.',
            color: '#FFD700' // Mango
        }
    };

    const details = personaDetails[topPersona] || personaDetails['Culture Seeker'];

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const formattedDate = formatDate(travelStatus.bookingDates);

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

            <DigitalGuideOverlay 
                avatarUrl={publicConfig?.home?.influencerPhoto || '/assets/Alexhurd1.jpg'} 
                name={`${influencer?.name || 'Alex Hurd'} - Digital Guide`}
                isVisible={true}
                positionStyle={{ bottom: '40px', right: '40px' }}
            />

            <AudioController audioKey="completion" active={true} />

            <div className="completion-content animate-fade-in" style={{ position: 'relative', zIndex: 10, maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                {/* Header elements removed per user request - starting with subtitle */}
                <p style={{
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    color: 'var(--color-accent-secondary)',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                }}>
                    THE SPEAKEASY HAS BEEN UNLOCKED
                </p>


                {/* ─── MEMBERSHIP CARD ─── */}
                <div className="speakeasy-card-container" style={{ perspective: '1000px', marginBottom: '20px' }}>
                    <div className="membership-card glass-panel" style={{
                        width: '100%',
                        maxWidth: '560px',
                        margin: '0 auto',
                        padding: '20px',
                        borderRadius: '24px',
                        background: 'rgba(5, 5, 20, 0.92)',
                        border: `3px solid ${details.color}`,
                        boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 30px ${details.color}40`,
                        textAlign: 'left',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Card header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                            <div>
                                <h4 style={{ color: details.color, letterSpacing: '3px', fontSize: '0.7rem', margin: '0 0 4px 0', fontWeight: '800' }}>OFFICIAL SPEAKEASY ACCESS</h4>
                                <h2 style={{ fontSize: '1.6rem', margin: '0', color: 'white', fontWeight: '800', lineHeight: 1.1 }}>{publicConfig.home.title}</h2>
                            </div>
                            <img src="/assets/msc.logo.png" style={{ height: '50px', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                        </div>

                        {/* QR + Identity row */}
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', marginBottom: '20px' }}>
                            {/* QR replaces the key */}
                            <div style={{
                                background: 'white',
                                borderRadius: '14px',
                                padding: '12px',
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                border: `3px solid ${details.color}`,
                                boxShadow: `0 0 25px ${details.color}50`,
                                animation: 'pulse-qr 2.5s infinite ease-in-out'
                            }}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`MSC_REWARD_${(topPersona || 'VOYAGER').toUpperCase()}_v17`)}`}
                                    alt="Speakeasy QR"
                                    style={{ width: '120px', height: '120px', display: 'block' }}
                                    onError={(e) => {
                                        console.error('QR Code failed to load');
                                        e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MSC_REWARD_GENERIC_v17';
                                    }}
                                />
                                <div style={{ color: '#050510', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1.5px', textAlign: 'center' }}>SCAN TO REDEEM</div>
                            </div>

                            {/* Voyager status */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', display: 'block', letterSpacing: '1.5px', fontWeight: '800', marginBottom: '2px' }}>TRAVEL VIBE</label>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: details.color }}>{details.title.toUpperCase()}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', display: 'block', letterSpacing: '1.5px', fontWeight: '800', marginBottom: '2px' }}>CHARTED BY</label>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>{(influencer?.name || 'MSC Cruises').toUpperCase()}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', fontWeight: '800' }}>SAIL DATE</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'white' }}>{formattedDate || 'FLEXIBLE'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', fontWeight: '800' }}>ID</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'white' }}>#MSC-{Math.floor(Math.random() * 9000) + 1000}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Travel Vibe + Offer inset box */}
                        <div style={{
                            padding: '18px 20px',
                            background: `${details.color}12`,
                            borderRadius: '14px',
                            border: `1px solid ${details.color}50`,
                        }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)', fontWeight: '400' }}>
                                {details.desc}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: `${details.color}18`, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${details.color}30` }}>
                                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💎</span>
                                <div>
                                    <span style={{ color: details.color, fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Exclusive Voyager Offer</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>{details.offer}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── CTAs ─── */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '35px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => window.open('https://www.msccruises.com', '_blank')}
                        style={{
                            flex: 1,
                            minWidth: '180px',
                            padding: '18px 28px',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: '900',
                            letterSpacing: '2px',
                            background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                            color: '#050510',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 8px 30px rgba(255,215,0,0.4)',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        ⚓ UPGRADE NOW
                    </button>
                    <button
                        onClick={() => {
                            const text = `My Travel Vibe is: ${details.title}!\n\n"${details.desc}"\n\nMy exclusive offer: ${details.offer}\n\n#MSCCruises #TravelVibe`;
                            if (navigator.share) {
                                navigator.share({ title: 'My MSC Travel Vibe', text });
                            } else {
                                navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard! Paste it to share.'));
                            }
                        }}
                        style={{
                            flex: 1,
                            minWidth: '180px',
                            padding: '18px 28px',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: '900',
                            letterSpacing: '2px',
                            background: 'transparent',
                            color: details.color,
                            border: `2px solid ${details.color}`,
                            cursor: 'pointer',
                            boxShadow: `0 8px 25px ${details.color}30`,
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        📲 SHARE VIBE
                    </button>
                </div>

                {/* ─── DIGITAL COLLECTIBLES ─── */}
                {backpack.length > 0 && (
                    <div className="collectibles-section glass-panel animate-fade-in-up" style={{
                        padding: '30px',
                        textAlign: 'left',
                        marginBottom: '30px',
                        border: '1px solid var(--color-accent-primary)',
                        background: 'rgba(10, 10, 30, 0.6)',
                        color: 'white',
                        animationDelay: '0.2s'
                    }}>
                        <h3 style={{ color: '#00e5ff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🎁</span> YOUR REWARDS & COLLECTIBLES
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {backpack.filter(item => item.title || item.collectible?.title).map((item, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: '16px',
                                    padding: '15px',
                                    border: '1px solid var(--color-accent-primary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                    <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                                        {item.collectible?.type === 'video' || item.collectible?.type === 'mp4' ? (
                                            <video src={item.collectible?.url} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : item.collectible?.type === 'image' || item.collectible === true ? (
                                            <img src={item.collectible?.url || item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.collectible?.title || item.title} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                                {item.collectible?.type === 'mp3' ? '🎵' : item.collectible?.type === 'pdf' ? '📄' : item.collectible?.type === 'medal' ? '🏅' : '🏆'}
                                            </div>
                                        )}
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{item.collectible?.title || item.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: 'white' }}>{item.collectible?.description || item.description}</p>
                                    <button
                                        onClick={() => window.open(item.collectible?.url || item.url, '_blank')}
                                        className="btn-primary"
                                        style={{ padding: '8px', fontSize: '0.7rem', width: '100%', marginTop: 'auto' }}
                                    >
                                        {item.collectible.type === 'mp3' ? 'LISTEN NOW' : item.collectible.type === 'pdf' ? 'DOWNLOAD PDF' : item.collectible.type === 'image' ? 'VIEW FULL' : 'VIEW 3D Trophy'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Utility buttons */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={() => window.location.href = '/'} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Return to Ship
                    </button>
                    <button onClick={() => window.print()} style={{ padding: '12px 24px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Save Membership Pass
                    </button>
                </div>



            </div>

            <style>
                {`
                    @keyframes pulse-qr {
                        0% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); }
                        50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(0, 229, 255, 0.7); }
                        100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); }
                    }
                    @keyframes cardFloat {
                        0% { transform: translateY(0) rotateX(0); }
                        50% { transform: translateY(-10px) rotateX(2deg); }
                        100% { transform: translateY(0) rotateX(0); }
                    }

                    .membership-card {
                        animation: cardFloat 6s ease-in-out infinite;
                    }
                    .text-gradient {
                        background: linear-gradient(to bottom, #fff 0%, #aaa 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .animate-fade-in-up {
                        animation: fadeInUp 0.8s ease-out forwards;
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
};

export default CompletionPage;
