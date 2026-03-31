import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useInfluencer } from '../../context/InfluencerContext';

const AdminLayout = () => {
    const { currentInfluencer: ctxInfluencer, logout } = useInfluencer();
    const navigate = useNavigate();

    // Read from BOTH context and localStorage — whichever is populated wins
    // This eliminates the async race condition between login() and navigation
    const currentInfluencer = ctxInfluencer || (() => {
        try {
            const saved = localStorage.getItem('currentInfluencer_v9');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    })();

    useEffect(() => {
        if (!currentInfluencer) {
            navigate('/admin/login');
        }
    }, [currentInfluencer, navigate]);

    if (!currentInfluencer) return null;

    return (
        <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', color: '#333' }}>
            <nav style={{ backgroundColor: '#fff', padding: '1rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Influencer Hub</h2>
                    <span style={{ backgroundColor: '#eee', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                        Logged in as {currentInfluencer.name}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/companies" style={{ textDecoration: 'none', color: '#666' }}>Campaigns</Link>
                    <button onClick={() => { logout(); navigate('/'); }} style={{ border: 'none', background: 'none', color: '#d9534f', cursor: 'pointer' }}>
                        Logout
                    </button>
                    <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>View Live Site</Link>
                </div>
            </nav>
            <div style={{ padding: '2rem' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;

