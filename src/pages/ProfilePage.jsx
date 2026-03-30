import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { influencer } = useGame();

    return (
        <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
            <div className="profile-page glass-panel animate-fade-in" style={{
                maxWidth: '600px',
                width: '100%',
                padding: '50px',
                color: 'var(--color-text-main)',
                background: 'var(--color-bg-card)',
                textAlign: 'center',
                border: '1px solid var(--color-accent-primary)',
                boxShadow: '0 15px 45px rgba(91, 192, 222, 0.2)'
            }}>
                <div className="profile-header" style={{ marginBottom: '30px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={influencer?.image || '/assets/Alexhurd1.jpg'}
                            alt={influencer?.name}
                            style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px', border: '4px solid var(--color-accent-primary)', boxShadow: '0 0 20px rgba(91, 192, 222, 0.3)' }}
                        />
                        <div style={{ position: 'absolute', bottom: '25px', right: '5px', background: 'var(--color-accent-coral)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '2px solid white' }}>✨</div>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--color-accent-secondary)', marginBottom: '5px' }}>Member Profile</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontWeight: '600', letterSpacing: '1px' }}>{influencer?.name?.toUpperCase() || 'ALEX HURD'}</p>
                </div>

                <div className="profile-info" style={{ marginBottom: '40px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                    <p>Explore experiences across the MSC World Europa to fill your backpack with exclusive rewards and member deals.</p>
                </div>

                <button
                    onClick={() => navigate('/teleport')}
                    className="btn-primary"
                    style={{ width: '100%', padding: '15px' }}
                >
                    BACK TO EXPERIENCE HUB
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
