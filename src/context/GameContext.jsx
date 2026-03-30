import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useInfluencer } from './InfluencerContext';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const { publicConfig, publicInfluencer } = useInfluencer();

    // User Preferences from Teleport Page
    const [preferences, setPreferences] = useState({});

    // Backpack: Array of activity objects { id, title, type, description, image }
    // Initialize from localStorage to persist across refreshes
    const [backpack, setBackpack] = useState(() => {
        try {
            const saved = localStorage.getItem('gameBackpack');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('[GameContext] Failed to load backpack from localStorage:', e);
            return [];
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
        'Wellness Voyager': 0,
        'Culture Seeker': 0,
        'Family Planner': 0,
        'Work from Sea': 0,
        'Social Foodie': 0,
        'The Alchemist': 0,
        'Social Storyteller': 0,
        'The Sovereign': 0
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

    // Challenges: Track progress in each experience
    // Structure: { 'experienceId': { coinFound: false, objectsFound: 0, completed: false } }
    const [challenges, setChallenges] = useState({
        'exp-1': { coinFound: false, objectsFound: 0, completed: false },
        'exp-2': { coinFound: false, objectsFound: 0, completed: false },
        'exp-3': { coinFound: false, objectsFound: 0, completed: false },
        'exp-4': { coinFound: false, objectsFound: 0, completed: false },
        'exp-5': { coinFound: false, objectsFound: 0, completed: false },
        'exp-6': { completed: false }, // Loyalty challenge
    });

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
                    // Have to use setBasePersonaScores directly here to avoid dependency loop with updateInterest
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
        image: '/assets/Alexhurd1.jpg', // Alex Hurd photo
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

    // Persist backpack to localStorage whenever it changes
    React.useEffect(() => {
        try {
            localStorage.setItem('gameBackpack', JSON.stringify(backpack));
            console.log('%c[GameContext] Saved backpack to localStorage:', 'color: #00e5ff;', backpack.length, 'items');
        } catch (e) {
            console.error('[GameContext] Failed to save backpack to localStorage:', e);
        }
    }, [backpack]);

    const updateInterest = React.useCallback((category, weight) => {
        if (!category) return;
        setBasePersonaScores(prev => ({
            ...prev,
            [category]: (prev[category] || 0) + weight
        }));
    }, []);

    const trackTime = React.useCallback((category, seconds) => {
        if (!category) return;
        setTimeSpentSeconds(prev => ({
            ...prev,
            [category]: (prev[category] || 0) + seconds
        }));

        let weight = 0;
        if (seconds > 60) weight = 20; // High Engagement
        else if (seconds < 15) weight = -10; // Low Engagement
        else weight = Math.floor(seconds / 10); // Normal fallback

        updateInterest(category, weight);
    }, [updateInterest]);

    const addToBackpack = React.useCallback((item) => {
        console.log('%c[GameContext] Adding to backpack:', 'color: #00ff00; font-weight: bold;', item);
        setBackpack(prev => {
            if (prev.find(i => i.id === item.id)) {
                console.log('%c[GameContext] Item already in backpack, skipping:', 'color: #ff9800;', item.id);
                return prev;
            }
            triggerSound('backpack');

            const mapping = {
                'Spa Pass': { persona: 'Wellness Voyager', weight: 40 },
                'Wi-Fi Package': { persona: 'Work from Sea', weight: 40 },
                'Excursion Guide': { persona: 'Culture Seeker', weight: 40 },
                'Thermal Spa Haven': { persona: 'Wellness Voyager', weight: 10 },
                'Luxury': { persona: 'The Sovereign', weight: 10 },
                'Yacht Club Access': { persona: 'The Sovereign', weight: 20 },
                'Hola Dining Spot': { persona: 'Social Foodie', weight: 10 },
                'Kids Activities': { persona: 'Family Planner', weight: 10 },
                'Kids Arcade Zone': { persona: 'Family Planner', weight: 20 },
                'Culture Challenge Spot': { persona: 'Culture Seeker', weight: 10 },
                'Fine Wine': { persona: 'The Alchemist', weight: 10 },
                'Speakeasy Coin': { persona: 'Social Storyteller', weight: 15 }
            };

            const match = mapping[item.name] || mapping[item.title];
            let category = match ? match.persona : 'Culture Seeker';
            let weight = match ? match.weight : 5;

            // Handle Collectible specific weighting and sound
            if (item.collectible) {
                weight += 50; // Significant bonus for collectibles
                if (item.collectible.type === 'mp3' && item.collectible.url) {
                    // Play the collectible sound if it's an MP3
                    const audio = new Audio(item.collectible.url);
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log("Audio play blocked"));
                }
            }

            updateInterest(category, weight);

            const newBackpack = [...prev, item];
            console.log('%c[GameContext] New backpack state:', 'color: #00e5ff;', newBackpack);
            return newBackpack;
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
        setLoyaltyPrograms(prev => ({
            ...prev,
            [program]: value
        }));
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

            // Check if coin was just found
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
        return Object.entries(interestInsights).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }, [interestInsights]);

    const isAllComplete = React.useCallback(() => {
        return getTotalCoins() >= 5;
    }, [getTotalCoins]);

    const resetProgress = React.useCallback(() => {
        setBackpack([]);
        setFavourites([]);
        setVisitedScenes([]);
        setBasePersonaScores({
            'Wellness Voyager': 0, 'Culture Seeker': 0, 'Family Planner': 0,
            'Work from Sea': 0, 'Social Foodie': 0, 'The Alchemist': 0,
            'Social Storyteller': 0, 'The Sovereign': 0
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
        localStorage.removeItem('gameBackpack');
        console.log("%c[GameContext] PROGRESS RESET", "color: #ff0000; font-weight: bold;");
    }, []);

    // Global start state to ensure overlay only shows once
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
            resetProgress
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
