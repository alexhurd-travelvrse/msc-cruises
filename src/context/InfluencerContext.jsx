import React, { createContext, useState, useContext, useEffect } from 'react';
import configTruth from '../data/config_truth.json';
import voiceoverManifest from '../data/voiceoverManifest.json';

const InfluencerContext = createContext();

export const useInfluencer = () => useContext(InfluencerContext);

export const InfluencerProvider = ({ children }) => {
    const publicInfluencerId = '1';
    const publicCompanyId = import.meta.env.VITE_ACTIVE_COMPANY || 'msc-cruises';

    const initialInfluencers = [
        { id: '1', name: 'Alex Hurd', type: 'Digital Nomad', avatar: '/assets/Alexhurd1.jpg' },
        { id: '2', name: 'New Influencer', type: 'Luxury/Travel Blogger', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&q=80' }
    ];

    const companies = [
        { id: 'msc-cruises', name: 'MSC Cruises', type: 'cruise', status: 'active', image: '/assets/hero.png' },
        { id: 'travel-vrse', name: 'Travel-Vrse', type: 'portal', status: 'active', image: '/models/travelvrse logo.png' },
        { id: 'sun-gardens', name: 'Sun Gardens Dubrovnik', type: 'hotel', status: 'active', image: '/assets/hero.png' },
        { id: 'hilton', name: 'Hilton Connected Room', type: 'hotel', status: 'dumb', image: '/assets/hero.png' }
    ];

    const [currentInfluencer, setCurrentInfluencer] = useState(() => {
        try {
            const saved = localStorage.getItem('currentInfluencer_v16');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });
    const [currentDestination, setCurrentDestination] = useState(null);
    const [activeCompanyId, setActiveCompanyId] = useState(() => {
        try {
            const saved = localStorage.getItem('activeCompanyId_v16');
            return saved ? JSON.parse(saved) : 'msc-cruises';
        } catch (e) { return 'msc-cruises'; }
    });

    const [configs, setConfigs] = useState(() => {
        try {
            const saved = localStorage.getItem('influencerConfigs_v16');
            const cached = saved ? JSON.parse(saved) : {};
            console.log("[InfluencerContext] Initializing configs with truth + cache", { cachedKeys: Object.keys(cached) });
            return { ...configTruth, ...cached };
        } catch (e) { 
            console.error("[InfluencerContext] Config initialization error:", e);
            return { ...configTruth }; 
        }
    });

    useEffect(() => {
        console.log("[InfluencerContext] Active Company:", activeCompanyId);
        console.log("[InfluencerContext] Public Company:", publicCompanyId);
        console.log("[InfluencerContext] ConfigTruth Keys:", Object.keys(configTruth));
    }, [activeCompanyId, publicCompanyId]);

    const resetToTruth = () => {
        setConfigs({ ...configTruth });
        localStorage.setItem('influencerConfigs_v16', JSON.stringify(configTruth));
        console.log("%c[InfluencerContext] REVERTED TO GITHUB TRUTH", "color: #ff9800; font-weight: bold;");
    };

    const [earnings, setEarnings] = useState(() => {
        try {
            const saved = localStorage.getItem('influencerEarnings_v16');
            return saved ? JSON.parse(saved) : {};
        } catch (e) { return {}; }
    });


    const [influencers, setInfluencers] = useState(() => {
        try {
            const saved = localStorage.getItem('influencers_v16');
            return saved ? JSON.parse(saved) : initialInfluencers;
        } catch (e) { 
            return initialInfluencers; 
        }
    });

    const updateInfluencer = React.useCallback((id, newData) => {
        setInfluencers(prev => {
            const updated = prev.map(inv => inv.id === id ? { ...inv, ...newData } : inv);
            localStorage.setItem('influencers_v16', JSON.stringify(updated));
            if (currentInfluencer && currentInfluencer.id === id) {
                setCurrentInfluencer({ ...currentInfluencer, ...newData });
            }
            return updated;
        });
    }, [currentInfluencer]);


    useEffect(() => {
        const loadConfigs = () => {
            try {
                const savedConfigs = localStorage.getItem('influencerConfigs_v16');
                if (savedConfigs) {
                    const parsed = JSON.parse(savedConfigs);
                    setConfigs(prev => ({ ...configTruth, ...parsed }));
                }
                const savedEarnings = localStorage.getItem('influencerEarnings_v16');
                if (savedEarnings) setEarnings(JSON.parse(savedEarnings));
            } catch (e) {
                console.warn("[InfluencerContext] LocalStorage check failed:", e);
            }
        };
        const handleStorageChange = (e) => {
            if (e.key === 'influencerConfigs_v16' || e.key === 'influencerEarnings_v16') loadConfigs();
        };
        window.addEventListener('storage', handleStorageChange);
        loadConfigs();
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (influencerId) => {
        const influencer = influencers.find(i => i.id === influencerId);
        setCurrentInfluencer(influencer);
        localStorage.setItem('currentInfluencer_v16', JSON.stringify(influencer));
    };

    const logout = () => {
        setCurrentInfluencer(null);
        setActiveCompanyId(null);
        localStorage.removeItem('currentInfluencer_v16');
        localStorage.removeItem('activeCompanyId_v16');
    };

    const selectCompany = (companyId) => {
        setActiveCompanyId(companyId);
        localStorage.setItem('activeCompanyId_v16', JSON.stringify(companyId));
    };

    const getConfig = React.useCallback((influencerId, companyId) => {
        const targetId = influencerId || (currentDestination === companyId ? 'destination' : publicInfluencerId);
        const influencerKey = `${targetId}_${companyId}`;
        const destinationKey = `destination_${companyId}`;

        const savedInfluencer = configs[influencerKey];
        const savedDestination = configs[destinationKey];
        const defaultConfig = configTruth.experiences ? configTruth : (configTruth[companyId] || {});

        const baseConfig = savedInfluencer || savedDestination || defaultConfig;
        
        // Merge in the voiceover manifest for the active company
        const companyAudioFiles = voiceoverManifest[companyId] || {};

        return {
            ...defaultConfig,
            ...baseConfig,
            home: { ...defaultConfig?.home, ...(baseConfig?.home || {}) },
            teleport: { ...defaultConfig?.teleport, ...(baseConfig?.teleport || {}) },
            audio: { ...defaultConfig?.audio, ...(baseConfig?.audio || {}) },
            audioFiles: { ...companyAudioFiles, ...(baseConfig.audioFiles || {}) },
            coins: { ...defaultConfig.coins, ...(baseConfig.coins || {}) },
            experiences: {
                ...defaultConfig.experiences,
                ...Object.keys(baseConfig.experiences || {}).reduce((acc, key) => {
                    const defaultExp = defaultConfig.experiences?.[key] || {};
                    const baseExp = baseConfig.experiences?.[key] || {};

                    acc[key] = {
                        ...defaultExp,
                        ...baseExp,
                        items: (baseExp.items && baseExp.items.length > 0)
                            ? baseExp.items
                            : (defaultExp.items || []),
                        extraObjects: (baseExp.extraObjects && baseExp.extraObjects.length > 0)
                            ? baseExp.extraObjects
                            : (defaultExp.extraObjects || [])
                    };
                    return acc;
                }, {})
            },
            personas: { ...defaultConfig.personas, ...(baseConfig.personas || {}) }
        };
    }, [configs, currentDestination, publicInfluencerId]);

    const saveConfig = React.useCallback((influencerId, companyId, newConfig) => {
        const id = influencerId || (currentDestination === companyId ? 'destination' : null);
        if (!id) return;
        const key = `${id}_${companyId}`;
        const updatedConfigs = { ...configs, [key]: newConfig };
        setConfigs(updatedConfigs);
        localStorage.setItem('influencerConfigs_v16', JSON.stringify(updatedConfigs));
    }, [configs, currentDestination]);

    const updateEarnings = React.useCallback((influencerId, amount) => {
        const current = earnings[influencerId] || 0;
        const newEarnings = { ...earnings, [influencerId]: current + amount };
        setEarnings(newEarnings);
        localStorage.setItem('influencerEarnings_v16', JSON.stringify(newEarnings));
    }, [earnings]);

    const loginAsDestination = (companyId) => setCurrentDestination(companyId);
    const logoutDestination = () => setCurrentDestination(null);

    const activeInfluencerId = currentInfluencer?.id || publicInfluencerId;
    const publicConfig = getConfig(activeInfluencerId, publicCompanyId);
    const publicInfluencer = influencers.find(i => i.id === activeInfluencerId) || influencers[0];

    return (
        <InfluencerContext.Provider value={{
            influencers,
            companies,
            currentInfluencer,
            currentDestination,
            activeCompanyId,
            publicCompanyId,
            publicInfluencer,
            configs,
            earnings,
            login,
            logout,
            loginAsDestination,
            logoutDestination,
            selectCompany,
            updateInfluencer,
            getConfig,
            saveConfig,
            updateEarnings,
            resetToTruth,
            publicConfig
        }}>
            {children}
        </InfluencerContext.Provider>
    );
};
