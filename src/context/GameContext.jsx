import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useInfluencer } from './InfluencerContext';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const { publicConfig, manifest } = useInfluencer();

    // User Preferences
    const [preferences, setPreferences] = useState({});

    // Storage Keys (multi-tenant aware)
    const activeSlug = manifest?.client_metadata?.slug || 'default';
    const STORAGE_KEY = `vrse_backpack_${activeSlug}_v1`;
    const CHALLENGE_KEY = `vrse_challenges_${activeSlug}_v1`;

    const [backpack, setBackpack] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [challenges, setChallenges] = useState(() => {
        try {
            const saved = localStorage.getItem(CHALLENGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) { return {}; }
    });

    const [travelStatus, setTravelStatus] = useState({
        activeBadges: [] // Array of badge IDs selected on Teleport page
    });

    // Interest Insights: Qualitative weightings based on behavior
    const [interestScores, setInterestScores] = useState({});

    const addToBackpack = React.useCallback((item) => {
        setBackpack(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            
            // Calculate interest if tag is present
            if (item.data_tag) {
                setInterestScores(scores => ({
                    ...scores,
                    [item.data_tag]: (scores[item.data_tag] || 0) + 1
                }));
            }
            
            return [...prev, item];
        });
    }, []);

    const updateChallenge = React.useCallback((expId, update) => {
        setChallenges(prev => ({
            ...prev,
            [expId]: { ...(prev[expId] || {}), ...update }
        }));
    }, []);

    const updateInterest = React.useCallback((tag, weight) => {
        setInterestScores(scores => ({
            ...scores,
            [tag]: (scores[tag] || 0) + weight
        }));
    }, []);

    const getTopInterest = React.useCallback(() => {
        if (Object.keys(interestScores).length === 0) return 'Culture Seeker';
        return Object.entries(interestScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }, [interestScores]);

    const getTotalCoins = React.useCallback(() => {
        return Object.values(challenges).filter(c => c.coinFound).length;
    }, [challenges]);

    // Persist states
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backpack));
    }, [backpack, STORAGE_KEY]);

    useEffect(() => {
        localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenges));
    }, [challenges, CHALLENGE_KEY]);

    return (
        <GameContext.Provider value={{
            preferences, setPreferences,
            backpack, addToBackpack,
            challenges, updateChallenge,
            travelStatus, setTravelStatus,
            interestScores, updateInterest,
            getTopInterest,
            getTotalCoins,
            resetProgress: () => {
                setBackpack([]);
                setChallenges({});
                setInterestScores({});
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(CHALLENGE_KEY);
            }
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
