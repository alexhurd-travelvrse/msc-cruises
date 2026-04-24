import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const influencers = [{id: 'studio-x', name: 'Studio-X'}, {id: 'alex', name: 'Alex Hurd'}];
    const [selectedId, setSelectedId] = useState(influencers[0].id);

    const handleLogin = (e) => {
        e.preventDefault();
        // Since influencer auth isn't strict anymore with the manifest, we just proceed.
        navigate('/admin/companies');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Influencer Login</h1>
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Select Identity</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {influencers.map(inf => (
                                <option key={inf.id} value={inf.id}>{inf.name}</option>
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
                    
                    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm("Reset everything to source-of-truth? Your local edits will be cleared.")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '0.6rem',
                                backgroundColor: 'transparent',
                                color: '#999',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Emergency Reset: Clear Cached Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
