import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExperienceCanvas from '../components/ExperienceCanvas';
import NauticalLoader from '../components/NauticalLoader';
import FavouritesOverlay from '../components/FavouritesOverlay';
import DigitalGuideOverlay from '../components/DigitalGuideOverlay';
import Joystick from '../components/Joystick';
import { useGame } from '../context/GameContext';
import { useInfluencer } from '../context/InfluencerContext';
import { sceneConfig } from '../data/sceneConfig';
import SceneEditor from '../components/SceneEditor';
import AudioController from '../components/AudioController';
import { offerDatabase, calculateLiveOfferDiscount, goldenOffers } from '../data/offerDatabase';

const ExperiencePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateChallenge, addToBackpack, getTotalCoins, influencer, backpack, loyaltyPrograms, updateLoyaltyPrograms, resetProgress, trackTime, interestInsights, getTopInterest } = useGame();
    const { publicConfig, publicInfluencer, publicCompanyId, getConfig, saveConfig, resetToTruth } = useInfluencer();
    const brandingTitle = publicConfig?.home?.title?.toUpperCase() || "MSC WORLD EUROPA";
    const brandingSubtitle = publicConfig?.home?.subtitle || "Virtual Cruise Experience";

    const [modal, setModal] = useState(null);
    const [showFavourites, setShowFavourites] = useState(false);
    const [backpackUpdated, setBackpackUpdated] = useState(false);
    const viewedItems = useRef(new Set());
    const [isStarted, setIsStarted] = useState(false);
    const [isDelayedStarted, setIsDelayedStarted] = useState(false);
    const [isSplatLoaded, setIsSplatLoaded] = useState(false);
    // Production: icons visible after splat loads; coin/orb only after user interacts with icon
    const [isItemsAllowed, setIsItemsAllowed] = useState(false);
    const [isOrbAllowed, setIsOrbAllowed] = useState(false);
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [activeEditorObject, setActiveEditorObject] = useState(null);
    const [editorObjects, setEditorObjects] = useState([]);
    const [dialValues, setDialValues] = useState([0, 0, 0, 0]);
    const [puzzleError, setPuzzleError] = useState(false);
    const [puzzleCode, setPuzzleCode] = useState('');
    const [activeLiveOffer, setActiveLiveOffer] = useState(null);
    // Next-room preload progress (0-100)
    const [nextRoomProgress, setNextRoomProgress] = useState(0);
    const [nextRoomReady, setNextRoomReady] = useState(false);
    const startTimeRef = useRef(Date.now());

    useEffect(() => {
        if (!window.sceneEditorObjects) window.sceneEditorObjects = [];
    }, []);

    useEffect(() => {
        console.log(`%c[ExperiencePage] MOUNT - Room: ${id}`, 'color: #ff00ff; font-weight: bold;');
        return () => console.log(`%c[ExperiencePage] UNMOUNT - Room: ${id}`, 'color: #ff00ff;');
    }, [id]);

    useEffect(() => {
        console.log(`%c[ExperiencePage] isStarted changed: ${isStarted}`, 'color: #00ff00;');
    }, [isStarted]);

    // Reset all state when room changes
    useEffect(() => {
        setIsStarted(false);
        setIsDelayedStarted(false);
        setIsSplatLoaded(false);
        setIsItemsAllowed(false);
        setIsOrbAllowed(false);
        setModal(null);
        setNextRoomProgress(0);
        setNextRoomReady(false);
        startTimeRef.current = Date.now();
    }, [id]);

    // When splat loads AND user has started -> allow items (icons)
    useEffect(() => {
        const handleSplatLoaded = () => {
            console.log('[ExperiencePage] msc-splat-loaded event received');
            setIsSplatLoaded(true);
        };
        window.addEventListener('msc-splat-loaded', handleSplatLoaded);
        return () => window.removeEventListener('msc-splat-loaded', handleSplatLoaded);
    }, []);

    useEffect(() => {
        if (isSplatLoaded && isStarted) {
            console.log('[ExperiencePage] Splat loaded & Started -> Triggering msc-items-allowed');
            window.dispatchEvent(new CustomEvent('msc-items-allowed'));
            setIsItemsAllowed(true);
            // ORB/COIN now ONLY appears after user interacts with an icon (controlled in handleAddToBackpack/handleClose)
        }
    }, [isSplatLoaded, isStarted]);

    // Fail-safe: force started after 15s
    useEffect(() => {
        if (!isStarted) return;
        const timer = setTimeout(() => {
            if (!isSplatLoaded) {
                console.warn('[ExperiencePage] Fail-safe: forcing items allowed after timeout');
                setIsSplatLoaded(true);
            }
        }, 15000);
        return () => clearTimeout(timer);
    }, [isStarted, isSplatLoaded]);

    // Pre-load next room in background
    useEffect(() => {
        if (!isStarted || !isSplatLoaded) return;
        const nextId = parseInt(id) + 1;
        if (nextId > 5) return;
        const nextConfig = sceneConfig[String(nextId)];
        if (!nextConfig?.modelPath) return;

        const controller = new AbortController();
        const signal = controller.signal;
        const timer = setTimeout(async () => {
            setNextRoomProgress(0);
            setNextRoomReady(false);
            try {
                const res = await fetch(nextConfig.modelPath, { signal, priority: 'low' });
                if (!res.ok) return;
                const total = parseInt(res.headers.get('content-length') || '75000000', 10);
                const reader = res.body.getReader();
                let loaded = 0;
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done || signal.aborted) break;
                    loaded += value.length;
                    const pct = Math.min(Math.round(loaded / total * 100), 99);
                    setNextRoomProgress(pct);
                }
                if (!signal.aborted) {
                    setNextRoomReady(true);
                    setNextRoomProgress(100);
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.warn('[Navigator] Preload error:', e);
            }
        }, 1000);
        return () => { controller.abort(); clearTimeout(timer); };
    }, [id, isStarted, isSplatLoaded]);

    // Safety buffer to ensure GPU is free before mounting next room
    useEffect(() => {
        if (isStarted) {
            // Increased delay to 500ms to guarantee GC has time to clear previous contexts
            const timer = setTimeout(() => setIsDelayedStarted(true), 500);
            return () => clearTimeout(timer);
        } else {
            setIsDelayedStarted(false);
        }
    }, [isStarted]);

    useEffect(() => {
        if (showFavourites || !!modal) {
            document.exitPointerLock?.();
        }
    }, [showFavourites, modal]);

    useEffect(() => {
        window.isEditorModeActive = isEditorMode;
        window.activeEditorObject = activeEditorObject;
    }, [isEditorMode, activeEditorObject]);

    useEffect(() => {
        console.log("[ExperiencePage] isEditorMode state changed:", isEditorMode);
        if (!isEditorMode) {
            setEditorObjects([]);
            return;
        }

        console.log("[ExperiencePage] Starting Editor Polling...");

        const handleSync = (e) => {
            if (e.detail && e.detail.objects) {
                const newObjs = e.detail.objects;
                setEditorObjects(prev => {
                    if (prev.length === newObjs.length && prev.every((obj, i) =>
                        obj.id === newObjs[i].id &&
                        JSON.stringify(obj.pos) === JSON.stringify(newObjs[i].pos) &&
                        JSON.stringify(obj.rot) === JSON.stringify(newObjs[i].rot)
                    )) {
                        return prev;
                    }
                    console.log("[ExperiencePage] Editor sync (Event):", newObjs.length, "objects");
                    return newObjs;
                });
            }
        };
        window.addEventListener('scene-editor-update', handleSync);

        const timer = setInterval(() => {
            const currentObjs = window.sceneEditorObjects;
            if (currentObjs && currentObjs.length > 0) {
                setEditorObjects(prev => {
                    if (prev.length === currentObjs.length && prev.every((obj, i) =>
                        obj.id === currentObjs[i].id &&
                        JSON.stringify(obj.pos) === JSON.stringify(currentObjs[i].pos) &&
                        JSON.stringify(obj.rot) === JSON.stringify(currentObjs[i].rot)
                    )) {
                        return prev;
                    }
                    console.log(`%c[ExperiencePage] SYNC OK - ${currentObjs.length} items`, 'color: #00e5ff; font-weight: bold;');
                    return currentObjs;
                });
            } else {
                console.log("%c[ExperiencePage] SYNC WAIT... (Objects not found in window)", 'color: #ff9800;');
            }
        }, 1000);

        // Request a sync in case we are using old event-based code
        window.dispatchEvent(new CustomEvent('scene-editor-request-sync'));

        return () => {
            console.log("[ExperiencePage] Stopping Editor Polling...");
            clearInterval(timer);
            window.removeEventListener('scene-editor-update', handleSync);
        };
    }, [isEditorMode]);

    useEffect(() => {
        if (!isStarted) return;

        const startTime = Date.now();
        const categoryMapping = {
            '1': 'luxuryRoom',
            '2': 'wellness',
            '3': 'dining',
            '4': 'kidsActivities',
            '5': 'culture'
        };
        const category = categoryMapping[id] || 'culture';

        return () => {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            if (timeSpent > 0) {
                console.log(`[ExperiencePage] Tracking time for ${category}: ${timeSpent}s`);
                trackTime(category, timeSpent);
            }
        };
    }, [id, isStarted, trackTime]);

    const handleExport = () => {
        const configText = editorObjects.map(obj => {
            let text = `${obj.name}:\n  POS: [${obj.pos.map(p => p.toFixed(3)).join(', ')}]`;
            if (obj.rot) text += `\n  ROT: [${obj.rot.map(p => p.toFixed(3)).join(', ')}]`;
            return text;
        }).join('\n\n');
        navigator.clipboard.writeText(configText);
        console.log("Exported Config:\n", configText);
    };

    // Handle splat load signal from ExperienceCanvas 
    const handleSaveToContext = useCallback(async (objects) => {
        try {
            console.log("[ExperiencePage] handleSaveToContext called with objects:", objects.length);
            
            // 1. Get current config for this company & influencer
            const activeInfluencerId = influencer?.id || '1';
            const companyId = publicCompanyId;
            const currentConfig = getConfig(activeInfluencerId, companyId);

            // 2. Clone the experience config
            const updatedExperiences = { ...(currentConfig.experiences || {}) };
            const expConfig = { ...(updatedExperiences[id] || {}) };
            const updatedItems = [...(expConfig.items || [])];

            // 3. Update items in the experience
            objects.forEach(obj => {
                if (obj.id === 'activity') {
                    // ... (activity logic)
                    let mainItem = updatedItems.find(item => 
                        item.type === 'bell' || item.type === 'activity' || item.id === '1-1' || item.id === `${id}-1`
                    );
                    if (!mainItem && updatedItems.length > 0) mainItem = updatedItems[0];
                    if (mainItem) {
                        mainItem.position = obj.pos;
                        mainItem.rotation = obj.rot;
                    } else {
                        updatedItems.push({
                            id: `${id}-1`,
                            name: "Digital Highlight",
                            type: "activity",
                            position: obj.pos,
                            rotation: obj.rot,
                            text: "New influencer spotlight location."
                        });
                    }
                } else if (obj.id === 'coin') {
                    // ... (coin logic)
                    if (expConfig.coin) {
                        expConfig.coin.position = obj.pos;
                    } else {
                        expConfig.coin = { 
                            id: `special-${id}`, 
                            name: 'Sovereign Medal', 
                            position: obj.pos,
                            media: "/textures/coin.png"
                        };
                    }
                } else if (obj.id.startsWith('extra-')) {
                    // Update extra objects from sceneConfig if not in expConfig yet
                    if (!expConfig.extraObjects) {
                        const staticExp = sceneConfig[id] || {};
                        expConfig.extraObjects = staticExp.extraObjects ? JSON.parse(JSON.stringify(staticExp.extraObjects)) : [];
                    }
                    
                    const index = parseInt(obj.id.replace('extra-', ''));
                    if (expConfig.extraObjects[index]) {
                        expConfig.extraObjects[index].pos = obj.pos;
                        expConfig.extraObjects[index].rot = obj.rot;
                    }
                } else {
                    // Match by direct ID if possible (e.g. 'remote', 'menu')
                    const matchedItem = updatedItems.find(item => item.id === obj.id);
                    if (matchedItem) {
                        matchedItem.position = obj.pos;
                        matchedItem.rotation = obj.rot;
                    }
                }
            });

            // 4. Update Camera Position
            const cameraObj = objects.find(o => o.id === 'camera');
            if (cameraObj) {
                console.log("[ExperiencePage] Saving new camera start position:", cameraObj.pos);
                expConfig.startPos = cameraObj.pos;
                expConfig.startRot = cameraObj.rot;
            }

            // 5. Finalize update
            expConfig.items = updatedItems;
            updatedExperiences[id] = expConfig;
            const newConfig = { ...currentConfig, experiences: updatedExperiences };
            
            // Sync to LocalStorage (Immediate UI benefit)
            saveConfig(activeInfluencerId, companyId, newConfig);

            // Sync to Master Truth (Persistent Filesystem Update)
            try {
                const response = await fetch('/api/save-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ companyId, config: newConfig })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server responded with ${response.status}: ${errorText}`);
                }

                const result = await response.json();
                if (result && result.success) {
                    console.log("%c[ExperiencePage] MASTER TRUTH UPDATED SUCCESSFULLY", "color: #00ff00; font-weight: bold;");
                }
            } catch (err) {
                console.warn("[ExperiencePage] Filesystem sync failed. Ensure 'npm run dev' is running.", err);
                // We don't throw here so the user still gets the LocalStorage "success"
            }

            console.log("%c[ExperiencePage] Config saved successfully to Context!", "color: #00ff00; font-weight: bold;");
            return { success: true };
        } catch (error) {
            console.error("[ExperiencePage] Save error:", error);
            return { success: false, error: error.message };
        }
    }, [id, influencer, publicCompanyId, getConfig, saveConfig]);

    useEffect(() => {
        const handleSplatLoad = () => {
            console.log('[ExperiencePage] Splat loaded signal received');
            setIsSplatLoaded(true);
            // Reveal icons ONLY after splat is ready for interaction
            window.dispatchEvent(new CustomEvent('msc-items-allowed'));
        };
        window.addEventListener('msc-splat-loaded', handleSplatLoad);
        return () => window.removeEventListener('msc-splat-loaded', handleSplatLoad);
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'f') {
                setShowFavourites(prev => !prev);
            }
        };

        // Reveal activity items when the experience starts - MOVED TO SPLAT LOAD
        // window.dispatchEvent(new CustomEvent('msc-items-allowed'));

        const handleObjectClick = (e) => {
            const { name, experienceId } = e.detail;
            console.log('%c[ExperiencePage] Object clicked:', 'color: #ffff00; font-weight: bold;', { name, experienceId });

            if (name === 'Coin' || name === 'SpeakeasyCoin' || name === 'RestaurantSpeakeasyCoin' || name === 'msc-medal') {
                updateChallenge(experienceId, { coinFound: true });

                const dynamicCoin = publicConfig?.coins?.[experienceId];
                console.log(`[ExperiencePage] Coin linked to influencer content:`, dynamicCoin);

                if (experienceId === '5' || experienceId === 5) {
                    console.log("[ExperiencePage] Room 5 completion triggered by Coin click!");
                    navigate('/completion');
                    return;
                }

                setModal({
                    title: dynamicCoin?.title || 'Secret Clue Found',
                    description: dynamicCoin?.text || 'You found a secret clue! Add it to your backpack to keep it for the Speakeasy vault.',
                    image: dynamicCoin?.image || '/models/msc_clue1.jpg',
                    type: 'medal',
                    id: `medal-${experienceId}`,
                    collectible: {
                        type: 'image',
                        title: dynamicCoin?.title || `Medal #${experienceId}`,
                        url: dynamicCoin?.image || '/textures/coin.png',
                        description: dynamicCoin?.text || 'A secret medal found during your cruise.'
                    }
                });
            } else if (name === 'ActivityObject' || name === 'YachtClubStar' || name === 'RacingCarSimulator' || name === 'TVControl' || name === 'GymBall' || name === 'RestaurantMenu' || name === 'GaudiPanel') {
                const roomConfig = publicConfig?.experiences?.[String(experienceId)];
                
                // Specific handling for complex items like RestaurantMenu
                if (name === 'RestaurantMenu') {
                    const menuData = {
                        '3': {
                            title: 'Favourite Places to Eat',
                            description: 'My favourite places to eat onboard - Click to see something fun!',
                            options: ['Gourmet Dining', 'Fish', 'Steakhouse', 'Vietnamese']
                        },
                        '4': {
                            title: 'Gaming Lounge Menu',
                            description: 'Explore our latest gaming experiences and treats!',
                            options: ['Gelato', 'Racing Simulator', 'Gaming Competitions', '4D Cinema']
                        }
                    };
                    const currentMenu = menuData[experienceId] || menuData['3'];
                    setModal({
                        title: currentMenu.title,
                        description: currentMenu.description,
                        type: 'menu',
                        options: currentMenu.options,
                        image: experienceId === '3' ? '/assets/hola_grab.png' : '/assets/arcade_grab.png',
                        id: `menu-${experienceId}`
                    });
                    return;
                }

                // Generic Activity Objects - Fetch from Influence Context items
                const dynamicItem = roomConfig?.items?.find(item => {
                    const itemName = (item.name || "").toLowerCase();
                    const itemType = (item.type || "").toLowerCase();

                    if (name === 'TVControl') {
                        return itemType === 'tv' || itemName.includes('wi-fi') || itemName.includes('internet') || item.id === `${experienceId}-1`;
                    }
                    if (name === 'ActivityObject') {
                        return itemType === 'bell' || itemName.includes('service') || item.id === `${experienceId}-1` || item.id === `${experienceId}-2`;
                    }
                    if (name === 'YachtClubStar') return itemType === 'star' || itemName.includes('yacht');
                    if (name === 'RacingCarSimulator') return itemType === 'racing' || itemName.includes('racing');
                    if (name === 'GymBall') return itemType === 'spa' || itemName.includes('gym');
                    if (name === 'GaudiPanel') return itemName.includes('gaudi') || itemName.includes('panel');
                    
                    return false;
                }) || roomConfig?.items?.[0]; // Fallback to first item

                if (dynamicItem) {
                    console.log(`[ExperiencePage] Mapping ${name} to influencer item:`, dynamicItem.id, dynamicItem.name);
                    
                    // New Interaction Tracker: Add this item to the set of things viewed in this room
                    if (dynamicItem.id) {
                        viewedItems.current.add(dynamicItem.id);
                        
                        // Universal Completion Gate: Count expected items for this room
                        const expectedCount = (id === '1' || id === '5') ? 2 : 1;
                        const currentRoomItems = Array.from(viewedItems.current).filter(itemId => 
                            String(itemId).startsWith(`${id}-`) || 
                            (id === '1' && (itemId === 'tvcontrol-1' || itemId === 'activity-1'))
                        );

                        console.log(`[ExperiencePage] Room ${id} Progress: ${currentRoomItems.length}/${expectedCount}`);
                        
                        if (currentRoomItems.length >= expectedCount) {
                            window.dispatchEvent(new CustomEvent('msc-orb-allowed'));
                            console.log(`%c[ExperiencePage] Room ${id} Completion: Reveal the Coin.`, 'color: #FFD700; font-weight: bold;');
                        }
                    }

                    setModal({
                        title: dynamicItem.name || 'Digital Highlight',
                        description: dynamicItem.text || 'Check out this exclusive influencer-curated spot!',
                        image: dynamicItem.media || '/assets/balcony_grab.png',
                        video: dynamicItem.video,
                        collectible: dynamicItem.collectible,
                        type: 'activity',
                        id: dynamicItem.id || `activity-${experienceId}`
                    });
                } else {
                    // Static fallback for Room 1
                    if (experienceId === '1') {
                        setModal({
                            title: name === 'TVControl' ? 'Wi-Fi Packages' : 'Yacht Club Service',
                            description: 'Stay connected at sea with our premium satellite internet and 24/7 butler services.',
                            image: '/assets/balcony_preview.jpg',
                            type: 'activity',
                            id: `activity-${experienceId}`
                        });
                    }
                }
            } else if (name === 'TelephoneBox' || name === 'SpeakeasyEntry') {
                console.log("[ExperiencePage] TelephoneBox interaction disabled for new logic.");
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('object-clicked', handleObjectClick);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('object-clicked', handleObjectClick);
        };
    }, [id, updateChallenge, navigate, trackTime, publicConfig]);

    const handleAddToBackpack = () => {
        if (modal) {
            const discount = calculateLiveOfferDiscount(loyaltyPrograms, backpack);
            const liveOffer = offerDatabase[modal.id];

            const itemToAdd = liveOffer ? {
                id: modal.id,
                title: `${discount > 0 ? discount + '% OFF ' : ''}${liveOffer.baseTitle}`,
                description: liveOffer.description,
                type: 'offer',
                image: modal.image,
                icon: liveOffer.icon || '🎒', // Ensure icon from database is used
                discount: discount
            } : {
                id: modal.id,
                title: modal.title,
                description: modal.description,
                type: modal.type,
                image: modal.image,
                icon: modal.icon || (modal.type === 'medal' ? '🏅' : '🎒'), // Capture modal icon or use default
                collectible: modal.collectible,
                video: modal.video // Preserve video for future playback from backpack
            };

            console.log('%c[ExperiencePage] Adding to backpack:', 'color: #00ff00; font-weight: bold;', itemToAdd);
            addToBackpack(itemToAdd);

            // FLOW: Reveal the Medal (Orb) only AFTER interaction requirements are met
            if (experienceId === '5' || experienceId === 5) {
                // Room 5 needs 2 items. Check viewers or backpack.
                const count = Array.from(viewedItems.current).filter(i => String(i).startsWith('5-')).length;
                if (count >= 2) {
                    window.dispatchEvent(new CustomEvent('msc-orb-allowed'));
                    console.log('%c[ExperiencePage] Room 5 completion medal READY.', 'color: #00ff00; font-weight: bold;');
                }
            } else {
                window.dispatchEvent(new CustomEvent('msc-orb-allowed'));
                console.log('%c[ExperiencePage] Medal revealed for standard room.', 'color: #FFD700; font-weight: bold;');
            }

            if (liveOffer) {
                setActiveLiveOffer({
                    ...liveOffer,
                    discount: discount
                });
                setTimeout(() => setActiveLiveOffer(null), 3000);
            } else {
                // Generic popup for non-mapped items
                setActiveLiveOffer({
                    baseTitle: modal.title,
                    icon: '🎒',
                    discount: 0 // No specific discount for generic items for now
                });
                setTimeout(() => setActiveLiveOffer(null), 3000);
            }

            if (modal.title === 'Magic Ring' && getTotalCoins() >= 5) {
                setModal({
                    title: 'Speakeasy Entry Puzzle',
                    description: 'The Magic Ring has pulsed with energy! Enter the 4-digit code using the clues from your medals to unlock the secret speakeasy.',
                    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=600&q=80',
                    type: 'puzzle',
                    id: `puzzle-telephone-${id}`
                });
            } else {
                setModal(null);
            }
            setBackpackUpdated(true);
            setTimeout(() => setBackpackUpdated(false), 2000);
        }
    };

    const playInfluencerVoice = () => {
        // Voice is handled by AudioController below
        console.log("[ExperiencePage] Requesting voice play for room:", id);
    };

    const currentHotspots = sceneConfig[id]?.hotspots || [];
    const sceneThemes = {
        '1': { primary: '#d4af37', secondary: 'rgba(212, 175, 55, 0.2)', label: 'YACHT CLUB' },
        '2': { primary: '#00e5ff', secondary: 'rgba(0, 229, 255, 0.2)', label: 'SPA' },
        '3': { primary: '#ff8c00', secondary: 'rgba(255, 140, 0, 0.2)', label: 'SOCIAL' },
        '4': { primary: '#ff3d00', secondary: 'rgba(255, 61, 0, 0.2)', label: 'RACING' },
        '5': { primary: '#ffcc00', secondary: 'rgba(255, 204, 0, 0.2)', label: 'CULTURE' }
    };
    const currentTheme = sceneThemes[id] || sceneThemes['1'];

    return (
        <div className="experience-container" style={{ touchAction: 'none' }}>
            <DigitalGuideOverlay 
                avatarUrl={publicConfig?.home?.influencerPhoto || '/assets/Alexhurd1.jpg'} 
                name={`${publicInfluencer?.name || 'Alex'} - Guide`}
                isVisible={isStarted}
                positionStyle={{ top: '50%', left: '40px', transform: 'translateY(-50%)' }}
            />

            {/* Vibe Profiler Mini-HUD - LUXURY GLASS VERSION */}
            {isStarted && (
                <div style={{
                    position: 'fixed',
                    bottom: '120px',
                    right: '25px',
                    zIndex: 100,
                    textAlign: 'right'
                }}>
                    <div className="vibe-box glass-panel" style={{ 
                        padding: '12px 20px', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRight: `4px solid ${currentTheme.primary}`,
                        borderRadius: '12px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-end', 
                        background: 'rgba(5, 5, 20, 0.75)', 
                        backdropFilter: 'blur(15px)',
                        minWidth: '140px',
                        boxShadow: `0 0 20px ${currentTheme.secondary}`
                    }}>
                        <div style={{ 
                            fontSize: '0.65rem', 
                            color: currentTheme.primary, 
                            fontWeight: '900', 
                            letterSpacing: '3px', 
                            marginBottom: '4px',
                            textShadow: `0 0 5px ${currentTheme.primary}`
                        }}>
                             VIBE: {currentTheme.label}
                        </div>
                        <div style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '900', 
                            color: 'white', 
                            letterSpacing: '2px',
                            animation: 'pulse 2s infinite'
                        }}>
                            {getTopInterest().toUpperCase()}
                        </div>
                        <div style={{ 
                            height: '4px', 
                            width: '100%', 
                            background: 'rgba(255,255,255,0.1)', 
                            borderRadius: '2px', 
                            marginTop: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ 
                                height: '100%', 
                                width: '85%', 
                                background: currentTheme.primary,
                                boxShadow: `0 0 8px ${currentTheme.primary}`
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay Level */}
            {/* Audio Level */}
            <AudioController 
                audioKey={id} 
                active={isStarted} 
                script={publicConfig?.audio?.[id]} 
            />

            <NauticalLoader
                isVisible={!isSplatLoaded}
                progress={nextRoomProgress}
                isSplatLoaded={isSplatLoaded}
            />


            {/* 3D Core Layer */}
            <div className="experience-canvas-layer">
                <ExperienceCanvas
                    experienceId={id}
                    isInteractionActive={showFavourites || !!modal || isEditorMode}
                    isEditorMode={isEditorMode}
                    activeEditorObject={activeEditorObject}
                    isStarted={isStarted}
                />
            </div>

            {/* HUD / Progress Bar */}
            <div className="hud-overlay">
                <div className="hud-top-bar">
                    <div className="hud-info">
                        <div
                            className="location-badge"
                            onClick={() => navigate('/')}
                            style={{ cursor: 'pointer' }}
                            title="Back to Home"
                        >
                            {brandingTitle}
                        </div>

                    </div>


                    <div className="hud-stats" style={{ display: 'flex', gap: '8px' }}>
                        <div className="medal-box glass-panel" style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', color: '#ffd700',
                            padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderTop: '2px solid #ffd700',
                            background: 'rgba(5, 5, 20, 0.6)', backdropFilter: 'blur(10px)'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>🏅</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1' }}>
                                <span style={{ fontSize: '0.5rem', fontWeight: '800', opacity: 0.8, letterSpacing: '1px' }}>MEDALS</span>
                                <span style={{ fontWeight: '900', fontSize: '0.9rem', color: 'white' }}>{getTotalCoins()} / 5</span>
                            </div>
                        </div>

                        <div 
                            className={`backpack-box glass-panel ${backpackUpdated ? 'backpack-glow' : ''}`} 
                            onClick={() => setShowFavourites(true)} 
                            style={{ 
                                cursor: 'pointer', 
                                background: 'rgba(5, 5, 20, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderTop: `2px solid ${currentTheme.primary}`,
                                padding: '8px 16px',
                                borderRadius: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>🎒</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1' }}>
                                <span style={{ fontWeight: '800', fontSize: '0.5rem', opacity: 0.8, letterSpacing: '1px' }}>BACKPACK</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'white' }}>{backpack.length} ITEMS</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress bar hidden - was causing yellow line artifact */}
                {/* <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${(getTotalCoins() / 5) * 100}%` }} />
                </div> */}
            </div>

            {/* Interaction Modal */}
            {modal && (
                <div className="interaction-modal glass-panel animate-fade-in">
                    {modal.video ? (
                        <div style={{ marginBottom: '15px', borderRadius: '12px', overflow: 'hidden', background: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            <video 
                                src={modal.video} 
                                autoPlay 
                                loop 
                                muted={false}
                                controls 
                                style={{ width: '100%', display: 'block' } } 
                            />
                        </div>
                    ) : modal.image && (
                        <div style={{ marginBottom: '15px' }}>
                            <img
                                src={modal.image}
                                alt={modal.title}
                                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                            />
                        </div>
                    )}
                    <h3 className="modal-title">{modal.title}</h3>
                    <p className="modal-desc">{modal.description}</p>

                    {/* Loyalty Checklist Removed - Replaced by Yacht Club Access above */}

                    {modal.type === 'puzzle' && (
                        <div className="puzzle-container" style={{ textAlign: 'center', marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                {[0, 1, 2, 3].map(idx => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <button
                                            onClick={() => {
                                                const vals = [...dialValues];
                                                vals[idx] = (vals[idx] + 1) % 10;
                                                setDialValues(vals);
                                                setPuzzleError(false);
                                            }}
                                            className="dial-btn"
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            ▲
                                        </button>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0', minWidth: '40px' }}>
                                            {dialValues[idx]}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const vals = [...dialValues];
                                                vals[idx] = (vals[idx] - 1 + 10) % 10;
                                                setDialValues(vals);
                                                setPuzzleError(false);
                                            }}
                                            className="dial-btn"
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            ▼
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {puzzleError && (
                                <div style={{ color: '#ff4444', marginTop: '15px', fontWeight: 'bold' }}>
                                    INCORRECT CODE. TRY AGAIN.
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    const code = dialValues.join('');
                                    // Default code 1234 for now, plus 0000 for demo
                                    if (code === '1234' || code === '4321' || code === '0000') {
                                        window.dispatchEvent(new CustomEvent('trigger-confetti'));
                                        setModal(null);
                                        navigate('/completion');
                                    } else {
                                        setPuzzleError(true);
                                    }
                                }}
                                className="btn-primary"
                                style={{ marginTop: '30px', width: '100%' }}
                            >
                                UNLOCK & ENTER
                            </button>
                        </div>
                    )}

                    {modal.type === 'menu' && (
                        <div className="menu-options-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginTop: '20px'
                        }}>
                            {modal.options.map(option => (
                                <button
                                    key={option}
                                    className="menu-option-btn btn-glass"
                                    onClick={() => {
                                        if (option === 'Gourmet Dining' || option === 'Gelato') {
                                            const reward = option === 'Gourmet Dining'
                                                ? { id: 'wine-glass', name: 'Fine Wine', type: 'reward' }
                                                : { id: 'gelato', name: 'Luxury Gelato', type: 'Kids Activities' };

                                            addToBackpack(reward);
                                            window.dispatchEvent(new CustomEvent(option === 'Gourmet Dining' ? 'show-wine-glass' : 'show-gelato'));
                                            window.dispatchEvent(new CustomEvent('trigger-confetti'));
                                            setModal(null);
                                        } else {
                                            alert(`You selected: ${option}! This feature is coming soon.`);
                                            setModal(null);
                                        }
                                    }}
                                    style={{ padding: '15px 5px', fontSize: '0.9rem' }}
                                >
                                    {option.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="modal-actions">
                        {(modal.type === 'activity' || modal.type === 'offer' || modal.type === 'golden' || modal.type === 'medal') && (
                            <button onClick={() => {
                                handleAddToBackpack();
                                // Completion Logic: Track all viewed items in room
                                if (modal.id && !itemsViewed.includes(modal.id)) {
                                    const newViewed = [...itemsViewed, modal.id];
                                    setItemsViewed(newViewed);
                                    
                                    // Get items for current room
                                    const roomItems = publicConfig?.experiences?.[id]?.items || [];
                                    if (newViewed.length >= roomItems.length) {
                                        setIsOrbAllowed(true);
                                        window.dispatchEvent(new CustomEvent('msc-orb-allowed'));
                                        window.dispatchEvent(new CustomEvent('msc-items-allowed'));
                                    }
                                }
                                if (modal.type !== 'golden' && modal.type !== 'medal') {
                                    updateChallenge(`exp-${id}`, { objectsFound: 1 });
                                }
                            }} className="btn-primary">
                                {modal.type === 'medal' ? 'COLLECT MEDAL' : 'ADD TO BACKPACK'}
                            </button>
                        )}
                        <button onClick={() => {
                            if (modal.id && !itemsViewed.includes(modal.id)) {
                                const newViewed = [...itemsViewed, modal.id];
                                setItemsViewed(newViewed);
                                
                                const roomItems = publicConfig?.experiences?.[id]?.items || [];
                                if (newViewed.length >= roomItems.length) {
                                    setIsOrbAllowed(true);
                                    window.dispatchEvent(new CustomEvent('msc-orb-allowed'));
                                    window.dispatchEvent(new CustomEvent('msc-items-allowed'));
                                }
                            }
                            if (modal.type === 'activity' || modal.type === 'offer') {
                                updateChallenge(`exp-${id}`, { objectsFound: 1 });
                            }
                            setModal(null);
                        }} className="btn-glass" style={{ width: modal.type === 'menu' ? '100%' : 'auto', marginTop: modal.type === 'menu' ? '10px' : '0' }}>
                            CLOSE
                        </button>
                    </div>
                </div>
            )}

            {/* Persistent Progress / Navigation */}
            <div className="nav-complete-container">
                {/* Next room preload indicator */}
                {isStarted && nextRoomProgress > 0 && !nextRoomReady && (
                    <div style={{
                        fontSize: '0.65rem', color: 'rgba(0,229,255,0.7)',
                        letterSpacing: '2px', marginBottom: '8px', textAlign: 'center'
                    }}>
                        LOADING NEXT ROOM... {nextRoomProgress}%
                    </div>
                )}
                {isStarted && nextRoomReady && (
                    <div style={{
                        fontSize: '0.65rem', color: '#00ff88',
                        letterSpacing: '2px', marginBottom: '8px', textAlign: 'center'
                    }}>
                        ✓ NEXT ROOM READY
                    </div>
                )}
                <button
                    onClick={() => {
                        const nextId = parseInt(id) + 1;
                        if (nextId <= 5) navigate(`/experience/${nextId}`);
                        else navigate('/completion');
                    }}
                    className="btn-primary"
                    style={{ padding: '18px 50px', fontSize: '1rem', letterSpacing: '2px' }}
                >
                    CHALLENGE COMPLETE &rarr;
                </button>
            </div>

            {/* Speakeasy / Golden Offer Logic */}
            {
                id === '5' && getTotalCoins() >= 5 && (
                    <div style={{ display: 'none' }}>
                        {/* Secondary trigger for the Golden Offer could go here or via Event */}
                    </div>
                )
            }

            {showFavourites && <FavouritesOverlay onClose={() => setShowFavourites(false)} />}

            {/* Mobile Joystick */}
            {
                typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 && (
                    <Joystick color="#00e5ff" />
                )
            }

            {
                activeLiveOffer && (
                    <div className="dynamic-offer-popup animate-bounce-in" style={{
                        position: 'absolute',
                        top: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2000,
                        background: 'rgba(0, 229, 255, 0.9)',
                        padding: '20px 40px',
                        borderRadius: '50px',
                        boxShadow: '0 0 30px rgba(0, 229, 255, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        border: '2px solid white'
                    }}>
                        <span style={{ fontSize: '2rem' }}>{activeLiveOffer.icon}</span>
                        <div>
                            <div style={{ color: 'black', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                                {activeLiveOffer.discount > 0 ? `${activeLiveOffer.discount}% OFF ` : ''}{activeLiveOffer.baseTitle} {activeLiveOffer.discount > 0 ? 'ACTIVATED!' : 'ADDED!'}
                            </div>
                            <div style={{ color: 'rgba(0,0,0,0.7)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                STORED IN YOUR BACKPACK
                            </div>
                        </div>
                    </div>
                )
            }

            <SceneEditor
                isEditorMode={isEditorMode}
                setIsEditorMode={setIsEditorMode}
                activeObject={activeEditorObject}
                setActiveObject={setActiveEditorObject}
                objects={editorObjects}
                onExport={handleExport}
                onSaveToContext={handleSaveToContext}
                onResetToTruth={resetToTruth}
            />
        </div >
    );
};

export default ExperiencePage;
