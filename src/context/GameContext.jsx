import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useInfluencer } from './InfluencerContext';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const { publicConfig, publicInfluencer } = useInfluencer();

    // User Preferences from Teleport Page
    const [preferences, setPreferences] = useState({});

    // Storage Keys
    const STORAGE_KEY = 'msc_backpack_v16';
    const VIEWED_KEY = 'msc_itemsViewed_v16';
    const CHALLENGE_KEY = 'msc_challenges_v16';

    // Initialize from localStorage to persist across refreshes
    const [backpack, setBackpack] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('[GameContext] Failed to load backpack:', e);
            return [];
        }
    });

    const [itemsViewed, setItemsViewed] = useState(() => {
        try {
            const saved = localStorage.getItem(VIEWED_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [challenges, setChallenges] = useState(() => {
        try {
            const saved = localStorage.getItem(CHALLENGE_KEY);
            return saved ? JSON.parse(saved) : {
                'exp-1': { coinFound: false, objectsFound: 0, completed: false },
                'exp-2': { coinFound: false, objectsFound: 0, completed: false },
                'exp-3': { coinFound: false, objectsFound: 0, completed: false },
                'exp-4': { coinFound: false, objectsFound: 0, completed: false },
                'exp-5': { coinFound: false, objectsFound: 0, completed: false },
                'exp-6': { completed: false },
            };
        } catch (e) {
            return {
                'exp-1': { coinFound: false, objectsFound: 0, completed: false },
                'exp-2': { coinFound: false, objectsFound: 0, completed: false },
                'exp-3': { coinFound: false, objectsFound: 0, completed: false },
                'exp-4': { coinFound: false, objectsFound: 0, completed: false },
                'exp-5': { coinFound: false, objectsFound: 0, completed: false },
                'exp-6': { completed: false },
            };
        }
    });

    // Favourites: Array of experience/activity IDs
    const [favourites, setFavourites] = useState([]);

    const [travelStatus, setTravelStatus] = useState({
        bookingDates: null,
        isBooked: false,
        partySize: 1,
        hasFirstTimeBadge: false,
        hasSpecialOccasionBadge: false
    });

    // Interest Insights: Qualitative weightings based on behavior
    const [basePersonaScores, setBasePersonaScores] = useState({
        'Wellness Voyager': 0, 'Culture Seeker': 0, 'Family Planner': 0,
        'Work from Sea': 0, 'Social Foodie': 0, 'The Alchemist': 0,
        'Social Storyteller': 0, 'The Sovereign': 0
    });

    const [visitedScenes, setVisitedScenes] = useState([]);
    const [hasMadeFirstClick, setHasMadeFirstClick] = useState(false);
    const [dismissedItems, setDismissedItems] = useState([]);

    // Calculated Persona Scores
    const interestInsights = useMemo(() => {
        const scores = { ...basePersonaScores };
        const pConfig = publicConfig?.personas;

        // A. Influencer Source (The "Seed" Weight)
        if (pConfig && publicInfluencer?.type && pConfig.influencerWeights && pConfig.influencerWeights[publicInfluencer.type]) {
            const iWeights = pConfig.influencerWeights[publicInfluencer.type];
            for (const [p, w] of Object.entries(iWeights)) {
                scores[p] = (scores[p] || 0) + w;
            }
        }

        // Add Multipliers
        // B. First-Timer Multiplier
        if (pConfig && travelStatus.hasFirstTimeBadge && pConfig.firstTimerMultipliers) {
            for (const [p, mult] of Object.entries(pConfig.firstTimerMultipliers)) {
                scores[p] = Math.round((scores[p] || 0) * mult);
            }
        }

        // C. Special Occasion Multiplier
        if (pConfig && travelStatus.hasSpecialOccasionBadge && pConfig.specialOccasionMultipliers) {
            for (const [p, mult] of Object.entries(pConfig.specialOccasionMultipliers)) {
                scores[p] = Math.round((scores[p] || 0) * mult);
            }
        }

        console.log('[GameContext] Recalculated interestInsights:', scores);
        return scores;
    }, [basePersonaScores, publicConfig, publicInfluencer, travelStatus]);

    const [timeSpentSeconds, setTimeSpentSeconds] = useState({});

    // Persist states to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(backpack));
    }, [backpack]);

    useEffect(() => {
        localStorage.setItem(VIEWED_KEY, JSON.stringify(itemsViewed));
    }, [itemsViewed]);

    useEffect(() => {
        localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenges));
    }, [challenges]);

    // Current active experience for the 3D view
    const [currentExperience, setCurrentExperience] = useState(null);

    const visitScene = React.useCallback((expId) => {
        setVisitedScenes(prev => {
            if (prev.includes(expId)) return prev;

            const expToPersona = {
                '1': 'The Sovereign',
                '2': 'Wellness Voyager',
                '3': 'Social Foodie',
                '4': 'Family Planner',
                '5': 'The Alchemist'
            };

            const personaLayer = expToPersona[String(expId)];
            if (!personaLayer) return [...prev, expId];

            const newOrder = prev.length;
            const pWeights = publicConfig?.personas?.priorityWeights;

            if (pWeights) {
                let weight = 0;
                if (newOrder === 0) weight = pWeights.first || 30;
                else if (newOrder === 1) weight = pWeights.second || 15;
                else weight = pWeights.last || 5;

                if (weight > 0) {
                    setBasePersonaScores(scores => ({
                        ...scores,
                        [personaLayer]: (scores[personaLayer] || 0) + weight
                    }));
                }
            }
            return [...prev, expId];
        });
    }, [publicConfig]);

    // Influencer State
    const [influencer, setInfluencer] = useState({
        id: '1',
        name: 'Alex Hurd',
        handle: '@alexhurd',
        image: '/assets/Alexhurd1.jpg', 
        bio: 'Travel enthusiast and content creator showcasing the best of the world.',
        themeColor: '#0070f3'
    });

    const [loyaltyPrograms, setLoyaltyPrograms] = useState({
        msc: false,
        accor: false,
        marriott: false,
        virgin: false
    });

    const triggerSound = React.useCallback((type) => {
        const sounds = {
            coin: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
            backpack: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
            click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
        };
        const audio = new Audio(sounds[type] || sounds.click);
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Audio play blocked by browser policy"));
    }, []);

    const updateInterest = React.useCallback((category, weight) => {
        if (!category) return;
        setBasePersonaScores(prev => ({
            ...prev,
            [category]: (prev[category] || 0) + weight
        }));
    }, []);

    const trackTime = React.useCallback((category, seconds) => {
        if (!category) return;
        setTimeSpentSeconds(prev => ({ ...prev, [category]: (prev[category] || 0) + seconds }));

        let weight = 0;
        if (seconds > 60) weight = 20;
        else if (seconds < 15) weight = -10;
        else weight = Math.floor(seconds / 10);

        updateInterest(category, weight);
    }, [updateInterest]);

    const addToBackpack = React.useCallback((item) => {
        console.log('%c[GameContext] Adding to backpack:', 'color: #00ff00; font-weight: bold;', item);
        setBackpack(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            triggerSound('backpack');

            const mapping = {
                'Spa Pass': { persona: 'Wellness Voyager', weight: 40 },
                'Wi-Fi Package': { persona: 'Work from Sea', weight: 40 },
                'Excursion Guide': { persona: 'Culture Seeker', weight: 40 },
                'Yacht Club Access': { persona: 'The Sovereign', weight: 20 },
                'Hola Dining Spot': { persona: 'Social Foodie', weight: 10 },
                'Kids Arcade Zone': { persona: 'Family Planner', weight: 20 }
            };

            const match = mapping[item.name] || mapping[item.title];
            let category = match ? match.persona : 'Culture Seeker';
            let weight = match ? match.weight : 5;

            if (item.collectible) {
                weight += 50;
                if (item.collectible.type === 'mp3' && item.collectible.url) {
                    const audio = new Audio(item.collectible.url);
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log("Audio play blocked"));
                }
            }

            updateInterest(category, weight);
            return [...prev, item];
        });
        setFavourites(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
    }, [triggerSound, updateInterest]);

    const removeFromBackpack = React.useCallback((itemId) => {
        setBackpack(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const dismissItem = React.useCallback((itemId) => {
        if (!itemId) return;
        setDismissedItems(prev => prev.includes(itemId) ? prev : [...prev, itemId]);
    }, []);

    const updateLoyaltyPrograms = React.useCallback((program, value) => {
        setLoyaltyPrograms(prev => ({ ...prev, [program]: value }));
    }, []);

    const toggleFavourite = React.useCallback((id) => {
        setFavourites(prev => {
            if (prev.includes(id)) {
                return prev.filter(fid => fid !== id);
            } else {
                triggerSound('click');
                return [...prev, id];
            }
        });
    }, [triggerSound]);

    const updateChallenge = React.useCallback((expId, update) => {
        setChallenges(prev => {
            const newState = { ...prev };
            const current = newState[expId] || { coinFound: false, objectsFound: 0, completed: false };
            if (update.coinFound && !current.coinFound) {
                triggerSound('coin');
                updateInterest('The Sovereign', 10);
                return { ...newState, [expId]: { ...current, ...update, completed: true } };
            }
            return { ...newState, [expId]: { ...current, ...update } };
        });
    }, [triggerSound, updateInterest]);

    const getTotalCoins = React.useCallback(() => {
        return Object.values(challenges).filter(c => c.coinFound).length;
    }, [challenges]);

    const getTopInterest = React.useCallback(() => {
        const scores = interestInsights;
        return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }, [interestInsights]);

    const isAllComplete = React.useCallback(() => {
        return getTotalCoins() >= 5;
    }, [getTotalCoins]);

    const resetProgress = React.useCallback(() => {
        console.log("%c[GameContext] PERFORMING ROBUST PROGRESS RESET", "color: #ff0000; font-weight: bold;");
        
        setBackpack([]);
        setFavourites([]);
        setVisitedScenes([]);
        setBasePersonaScores({
            'Wellness Voyager': 0, 'Culture Seeker': 0, 'Family Planner': 0,
            'Work from Sea': 0, 'Social Foodie': 0, 'The Alchemist': 0,
            'Social Storyteller': 0, 'The Sovereign': 0
        });
        setTravelStatus({
            bookingDates: null, isBooked: false, partySize: 1,
            hasFirstTimeBadge: false, hasSpecialOccasionBadge: false
        });
        setTimeSpentSeconds({});
        setChallenges({
            'exp-1': { coinFound: false, objectsFound: 0, completed: false },
            'exp-2': { coinFound: false, objectsFound: 0, completed: false },
            'exp-3': { coinFound: false, objectsFound: 0, completed: false },
            'exp-4': { coinFound: false, objectsFound: 0, completed: false },
            'exp-5': { coinFound: false, objectsFound: 0, completed: false },
            'exp-6': { completed: false },
        });
        setLoyaltyPrograms({ msc: false, accor: false, marriott: false, virgin: false });
        setDismissedItems([]);
        setItemsViewed([]);
        
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VIEWED_KEY);
        localStorage.removeItem(CHALLENGE_KEY);
        localStorage.removeItem('gameBackpack'); // Legacy
        
        // Robustness: Clear configuration cache to force revert to config_truth.json
        localStorage.removeItem('influencerConfigs_v16');
        localStorage.clear(); 
        
        window.dispatchEvent(new CustomEvent('msc-progress-reset'));
        
        // Return to start
        window.location.href = '/experience/1?reset=true';
    }, []);

    const [hasStarted, setHasStarted] = useState(false);

    return (
        <GameContext.Provider value={{
            preferences, setPreferences,
            backpack, addToBackpack, removeFromBackpack,
            favourites, toggleFavourite,
            travelStatus, setTravelStatus,
            interestInsights, updateInterest,
            timeSpentSeconds, trackTime,
            getTopInterest,
            challenges, updateChallenge,
            hasMadeFirstClick, setHasMadeFirstClick,
            getTotalCoins, isAllComplete,
            currentExperience, setCurrentExperience, visitScene,
            hasStarted, setHasStarted,
            dismissedItems, dismissItem,
            influencer, setInfluencer,
            loyaltyPrograms, updateLoyaltyPrograms,
            itemsViewed, setItemsViewed,
            resetProgress
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
