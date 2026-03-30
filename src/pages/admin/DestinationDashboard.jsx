import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfluencer } from '../../context/InfluencerContext';
import { useGame } from '../../context/GameContext';

const DestinationDashboard = () => {
    const { currentDestination, companies, logoutDestination } = useInfluencer();
    const { getTotalCoins } = useGame();
    const navigate = useNavigate();

    if (!currentDestination) {
        navigate('/admin/destination-login');
        return null;
    }

    const company = companies.find(c => c.id === currentDestination);
    const totalBudget = 25000;

    // Calculate amount spent: $5 per completed challenge (coin)
    const coinsCollected = getTotalCoins();
    const amountSpent = coinsCollected * 5;
    const remainingBudget = totalBudget - amountSpent;

    // Dummy asset data
    const assets = {
        photos: 12,
        videos: 5,
        socialPosts: 8
    };

    // Mock approved influencers data
    const approvedInfluencers = [
        {
            id: '1',
            name: 'Alex Hurd',
            avatar: '/assets/Alex_Hurd.jpg',
            challengesCompleted: coinsCollected,
            earnings: amountSpent,
            status: 'active'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#333', margin: 0 }}>{company?.name} Campaign Dashboard</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/admin/config')}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Configure Experience
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            View Public Site
                        </button>
                        <button
                            onClick={() => {
                                logoutDestination();
                                navigate('/admin/destination-login');
                            }}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Budget Overview */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#333', marginTop: 0, marginBottom: '1.5rem' }}>Budget Overview</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Budget</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>${totalBudget.toLocaleString()}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Amount Spent</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>${amountSpent.toLocaleString()}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Remaining</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>${remainingBudget.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', borderLeft: '4px solid #007bff' }}>
                        <div style={{ fontSize: '0.85rem', color: '#004085' }}>
                            💡 <strong>Budget Calculation:</strong> $5 per completed challenge. {coinsCollected} challenges completed so far.
                        </div>
                    </div>
                </div>

                {/* Approved Influencers */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#333', marginTop: 0, marginBottom: '1.5rem' }}>Approved Influencers</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {approvedInfluencers.map(influencer => (
                            <div key={influencer.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                <img
                                    src={influencer.avatar}
                                    alt={influencer.name}
                                    style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '1rem', objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ margin: 0, color: '#333' }}>{influencer.name}</h3>
                                        {influencer.status === 'active' && (
                                            <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                                                ✅ Active
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Challenges Completed: </span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#007bff' }}>{influencer.challengesCompleted}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Earnings: </span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#28a745' }}>${influencer.earnings}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Approved Assets */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#333', marginTop: 0, marginBottom: '1.5rem' }}>Approved Assets</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📸</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{assets.photos}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Photos</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎥</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{assets.videos}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Videos</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{assets.socialPosts}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Social Posts</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDashboard;
