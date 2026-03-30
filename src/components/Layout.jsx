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
                                src="/models/msc.logo.png"
                                alt="MSC Cruises"
                                className="nav-logo"
                                style={{ height: '44px' }}
                            />
                        </Link>
                        <img
                            src="/models/travelvrse logo.png"
                            alt="Travelvrse"
                            style={{ height: '44px' }}
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
