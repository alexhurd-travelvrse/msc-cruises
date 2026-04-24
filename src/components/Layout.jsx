import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useInfluencer } from '../context/InfluencerContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const isExperiencePage = location.pathname.startsWith('/experience');
    const { publicConfig } = useInfluencer();
    const brandingTitle = publicConfig?.home?.title?.toUpperCase() || "VIRTUAL EXPERIENCE";

    return (
        <>
            {!isExperiencePage && (
                <header className="main-header">
                    <div className="container header-content">
                        <Link to="/" className="logo">
                            <img
                                src={publicConfig?.client_metadata?.brand_assets?.hotel_logo_url || "/models/25hrslogo.jpg"}
                                alt={publicConfig?.client_metadata?.hotel_name || "Partner Logo"}
                                className="nav-logo"
                                style={{ height: '55px' }}
                            />
                        </Link>
                        <img
                            src="/models/travelvrse logo.png"
                            alt="Travelvrse"
                            style={{ height: '55px' }}
                        />
                    </div>
                </header>
            )}
            <main className="main-content">
                {children}
            </main>
        </>
    );
};

export default Layout;
