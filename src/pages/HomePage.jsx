import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useInfluencer } from '../context/InfluencerContext';
import { useVoice } from '../context/VoiceContext';
import DigitalGuideOverlay from '../components/DigitalGuideOverlay';
import AudioController from '../components/AudioController';

const HomePage = () => {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [playAudio, setPlayAudio] = useState(false);
    const { initAudioContext } = useVoice();
    const [webglError, setWebglError] = useState(false);
    const videoRef = useRef(null);
    const { publicConfig, publicInfluencer } = useInfluencer();

    const heroImage = publicConfig?.home?.heroImage || null;

    useEffect(() => {
        const video = videoRef.current;
        if (video && heroImage) {
            video.muted = true;
            video.playsInline = true;
            
            // Re-load the video when src changes
            video.load();

            const playVideo = () => {
                const promise = video.play();
                if (promise !== undefined) {
                    promise.catch(error => {
                        console.warn('[Home] Video play promise rejected:', error);
                    });
                }
            };

            // Global interaction listener for audio context and voice
            const handleGlobalInteraction = () => {
                if (videoRef.current) {
                    videoRef.current.play().catch(() => {});
                }
                document.removeEventListener('click', handleGlobalInteraction);
                document.removeEventListener('touchstart', handleGlobalInteraction);
                document.removeEventListener('keydown', handleGlobalInteraction);
            };
            document.addEventListener('click', handleGlobalInteraction);
            document.addEventListener('touchstart', handleGlobalInteraction);
            document.addEventListener('keydown', handleGlobalInteraction);

            // Wait for enough data to be loaded
            if (video.readyState >= 2) {
                playVideo();
            } else {
                video.oncanplay = playVideo;
            }

            return () => {
                video.oncanplay = null;
            };
        }
    }, [heroImage]);

    if (!publicConfig || !publicConfig.home) {
        return <div className="loading-screen">Loading Home...</div>;
    }

    const { title, subtitle, influencerPhoto, description } = publicConfig.home;


    const handleStartChallenge = () => {
        setIsTransitioning(true);
        // Faster transition for better UX
        setTimeout(() => {
            navigate('/teleport');
        }, 800); 
    };

    const curatorName = publicInfluencer ? publicInfluencer.name : 'Alex Hurd';
    const curatorImage = influencerPhoto || (publicInfluencer ? publicInfluencer.avatar : '/assets/Alex_Hurd.jpg');

    return (
        <div className="home-page" style={{ position: 'relative', overflow: 'hidden', background: '#050B14' }}>
            <AudioController audioKey="home" active={!isTransitioning} />

            {/* HIGH-IMPACT VIDEO BACKGROUND */}
            <div className="hero-bg-container" style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#050B14' }}>
                <video 
                    ref={videoRef}
                    key={heroImage}
                    src={heroImage}
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1, transition: 'opacity 0.5s ease-in' }}
                />
                
                {/* Visual Overlay for Text Contrast */}
                <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%)', 
                    zIndex: 1, 
                    pointerEvents: 'none' 
                }} />
                
                {/* Fallback Background Image if video fails or is static */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1
                }} />
            </div>

            {/* Robust CSS/HTML Influencer Orb Overlay - Middle Left */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '40px',
                transform: 'translateY(-50%)',
                zIndex: 50
            }}>
                <DigitalGuideOverlay 
                    avatarUrl={curatorImage} 
                    name={`${curatorName} - Digital Guide`}
                    isVisible={!isTransitioning}
                    positionStyle={{ position: 'relative', bottom: '0', right: '0' }}
                />
            </div>

            {/* Subtle Audio Indicator */}
            {!playAudio && !isTransitioning && (
                <div 
                    onClick={() => {
                        console.log("[Home] Welcome click - initializing audio context");
                        initAudioContext();
                        setPlayAudio(true);
                        // Trigger a small interaction to unblock audio
                        if (videoRef.current) videoRef.current.play().catch(() => {});
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 229, 255, 0.2)',
                        border: '1px solid rgba(0, 229, 255, 0.5)',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        color: '#00e5ff',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        zIndex: 100,
                        backdropFilter: 'blur(5px)',
                        animation: 'pulse-slow 2s infinite'
                    }}
                >
                    🔊 CLICK FOR ALEX'S WELCOME
                </div>
            )}

            <style>{`
                @keyframes pulse-slow {
                    0% { opacity: 0.6; transform: translateX(-50%) scale(1); }
                    50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
                    100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
                }
            `}</style>

            <div className="container hero-content" style={{ position: 'relative', zIndex: 10 }}>
                <div className="curated-badge animate-fade-in animate-delay-1">
                    <img src={curatorImage} alt={curatorName} className="curator-img" />
                    <span>CURATED BY {curatorName.toUpperCase()}</span>
                </div>

                <h1 className="hero-title animate-fade-in animate-delay-1" style={{ color: '#fff', textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
                    <span>{title}</span>
                </h1>

                {subtitle && (
                    <p className="hero-subtitle animate-fade-in animate-delay-2" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '8px', textTransform: 'uppercase' }}>
                        {subtitle}
                    </p>
                )}

                {description && (
                    <p className="hero-description animate-fade-in animate-delay-2" style={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '1.1rem', 
                        lineHeight: '1.6', 
                        maxWidth: '700px', 
                        margin: '0 auto 3rem auto',
                        fontWeight: '300'
                    }}>
                        {description}
                    </p>
                )}

                <div className="benefits-list animate-fade-in animate-delay-2" style={{ marginTop: '1rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div className="benefit-item standout-benefit" style={{ 
                        background: 'rgba(0, 229, 255, 0.1)', 
                        border: '1px solid rgba(0, 229, 255, 0.4)', 
                        borderRadius: '4px', 
                        padding: '12px 18px',
                        transform: 'scale(1.02)',
                        boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)'
                    }}>
                        <span className="benefit-text" style={{ color: '#00e5ff', fontWeight: '600', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 0 10px rgba(0, 229, 255, 0.4)' }}>Get on the exclusive speakeasy guestlist</span>
                    </div>
                </div>

                <div className="reward-info animate-fade-in animate-delay-2" style={{ marginBottom: '2.5rem' }}>
                    <div className="reward-text">🪙 5 MEDALS FOUND</div>
                    <div className="reward-sub">🔑 2,500 POINTS UNLOCKED</div>
                </div>

                <button
                    onClick={handleStartChallenge}
                    className="btn-primary hero-btn animate-fade-in animate-delay-3"
                    disabled={isTransitioning}
                    style={{ marginBottom: '2rem' }}
                >
                    {isTransitioning ? 'INITIALIZING...' : 'ENTER EXPERIENCE'}
                </button>
            </div>

            <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', opacity: 0.7, display: 'flex', gap: '1rem', flexWrap: 'wrap', zIndex: 50 }}>
                <Link to="/admin/login" style={{ color: 'white', textDecoration: 'none', fontSize: '0.8rem' }}>Influencer Sign-in</Link>
                <span style={{ color: 'white' }}>|</span>
                <Link to="/admin/destination-login" style={{ color: 'white', textDecoration: 'none', fontSize: '0.8rem' }}>Destination Sign-in</Link>
            </div>
        </div>
    );
};

export default HomePage;
