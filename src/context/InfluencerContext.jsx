import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import mscEuropaConfig from '../data/msc_europa.json';
import hours25Config from '../data/25hours_indre.json';

const InfluencerContext = createContext();

export const useInfluencer = () => useContext(InfluencerContext);

const MANIFESTS = {
    'msc-europa': mscEuropaConfig,
    '25-hours-copenhagen': hours25Config
};

export const InfluencerProvider = ({ children }) => {
    // Current active company/whitelabel ID
    const [activeWhitelabelId, setActiveWhitelabelId] = useState(() => {
        try {
            const saved = localStorage.getItem('activeWhitelabelId_v1');
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const foundId = pathSegments.find(segment => MANIFESTS[segment]);
            if (foundId) return foundId;
            
            return saved || import.meta.env.VITE_WHITELABEL_ID || 'msc-europa';
        } catch (e) { return 'msc-europa'; }
    });

    const [manifest, setManifest] = useState(MANIFESTS[activeWhitelabelId] || MANIFESTS['msc-europa']);

    useEffect(() => {
        const newManifest = MANIFESTS[activeWhitelabelId] || MANIFESTS['msc-europa'];
        setManifest(newManifest);
        localStorage.setItem('activeWhitelabelId_v1', activeWhitelabelId);
        
        // Apply Brand Colors
        if (newManifest.client_metadata?.brand_assets?.primary_color) {
            document.documentElement.style.setProperty('--primary-brand-color', newManifest.client_metadata.brand_assets.primary_color);
        }
    }, [activeWhitelabelId]);

    const selectWhitelabel = (id) => {
        if (MANIFESTS[id]) {
            setActiveWhitelabelId(id);
        }
    };

    // Compatibility Layer for existing components
    const publicConfig = useMemo(() => {
        const homeConfig = manifest.client_metadata?.brand_assets || {};
        const experiences = {};
        
        // Map array experiences to indexed object for the engine
        (manifest.challenge_configuration?.experiences || []).forEach((exp) => {
            const key = exp.exp_id.toString();
            experiences[key] = {
                name: exp.name || exp.exp_id,
                splatUrl: exp.splat_url,
                startPos: exp.startPos,
                startRot: exp.startRot,
                backpack_icons: exp.backpack_icons, // Keep raw icons for Scene3D
                items: (exp.backpack_icons || []).map(icon => ({
                    id: icon.id,
                    name: icon.reward_label,
                    title: icon.reward_label,
                    description: icon.description || (icon.content_type === 'collectible' ? 'Found a new discovery!' : 'New info unlocked'),
                    media: icon.media || icon.image,
                    video: icon.video,
                    position: icon.coordinates ? [icon.coordinates.x, icon.coordinates.y, icon.coordinates.z] : (icon.position || [0,0,0]),
                    data_tag: icon.data_tag,
                    type: icon.content_type === 'collectible' ? 'medal' : 'activity',
                    discoveryMode: icon.discoveryMode || 'instant',
                    collectible: icon.collectible || {
                        title: icon.reward_label,
                        type: icon.content_type === 'collectible' ? 'medal' : 'pdf',
                        description: icon.description,
                        url: icon.media || icon.image
                    }
                }))
            };
        });

        return {
            id: manifest.client_metadata?.slug,
            home: {
                propertyName: manifest.client_metadata?.hotel_name,
                title: homeConfig.hero_text,
                heroImage: homeConfig.hero_image_url,
                partnerLogo: manifest.client_metadata?.brand_assets?.hotel_logo_url,
                influencerName: manifest.creator_metadata?.creator_name,
                influencerPhoto: manifest.creator_metadata?.orb_image_url,
                cta_primary: homeConfig.cta_primary,
                cta_secondary: homeConfig.cta_secondary,
                benefits: homeConfig.benefits || [
                    "✨ Discover your secret travel vibe",
                    "🎵 Collect exclusive soundtracks and guides",
                    "🏷️ Get a personalised onboard offer"
                ],
                highlightedBenefit: homeConfig.highlighted_benefit || "Get on the exclusive speakeasy guestlist"
            },
            teleport: {
                heroImage: manifest.teleport?.heroImage || manifest.teleport_configuration?.hero_image_url || '/assets/hero.png',
                backpackTitle: manifest.teleport?.backpackTitle || "Your Collection",
                backpackDesc: manifest.teleport?.backpackDesc || "Curated objects from your exploration",
                dataRequirements: manifest.teleport_configuration?.data_requirements || [
                    { id: "first_time", label: "✨ First Time Guest", tag: "new_guest" },
                    { id: "special_occasion", label: "🥂 Special Occasion", tag: "celebration" }
                ]
            },
            audioFiles: manifest.creator_metadata?.voiceovers || {},
            experiences
        };
    }, [manifest]);

    const publicInfluencer = useMemo(() => ({
        name: manifest.creator_metadata?.creator_name || 'Guide',
        avatar: manifest.creator_metadata?.orb_image_url || '/assets/avatar.jpg',
        bio: manifest.creator_metadata?.orb_bio || ''
    }), [manifest]);

    return (
        <InfluencerContext.Provider value={{
            activeWhitelabelId,
            selectWhitelabel,
            manifest,
            publicConfig,
            publicInfluencer,
            availableWhitelabels: Object.keys(MANIFESTS)
        }}>
            {children}
        </InfluencerContext.Provider>
    );
};
