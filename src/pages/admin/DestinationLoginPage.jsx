import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfluencer } from '../../context/InfluencerContext';

const DestinationLoginPage = () => {
    const { availableWhitelabels, selectWhitelabel } = useInfluencer();
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(availableWhitelabels && availableWhitelabels.length > 0 ? availableWhitelabels[0] : 'msc-europa');

    const handleLogin = (e) => {
        e.preventDefault();
        selectWhitelabel(selectedId);
        navigate('/admin/destination-dashboard');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Destination Login</h1>
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Select Destination</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {(availableWhitelabels || []).map(id => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        Enter Dashboard
                    </button>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <a href="/" style={{ color: '#666', fontSize: '0.9rem' }}>Back to Home</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DestinationLoginPage;
