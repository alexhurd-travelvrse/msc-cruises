export const offerDatabase = {
    'tvcontrol-1': {
        type: 'wifi',
        title: 'High-Speed Wi-Fi Package',
        baseTitle: 'Wi-Fi Package',
        icon: '📶',
        description: 'Stay connected at sea with our premium satellite internet.'
    },
    'activity-2': {
        type: 'spa',
        title: 'Thermal Spa Access',
        baseTitle: 'Spa Experience',
        icon: '🧖‍♀️',
        description: 'Full day access to the thermal area with saunas and steam rooms.'
    },
    'activity-4': {
        type: 'entertainment',
        title: 'Formula Racer Experience',
        baseTitle: 'Racing Simulator',
        icon: '🏎️',
        description: 'Multiple sessions on our state-of-the-art racing simulators.'
    },
    'yacht-offer-1': {
        type: 'room_upgrade',
        title: 'Yacht Club Upgrade',
        baseTitle: 'Suite Upgrade',
        icon: '✨',
        description: 'Elite luxury with butler service and private lounge access.'
    },
    'gelato': {
        type: 'dining',
        title: 'Venchi Gelato Treat',
        baseTitle: 'Gelato Offer',
        icon: '🍦',
        description: 'Enjoy authentic Italian gelato on the main promenade.'
    },
    'wine-glass': {
        type: 'dining',
        title: 'Fine Wine Selection',
        baseTitle: 'Wine Experience',
        icon: '🍷',
        description: 'Curated selection of world-class wines at our specialty bars.'
    }
};

export const goldenOffers = {
    'The Sovereign': {
        id: 'golden-butler',
        title: 'Personal Butler Upgrade',
        icon: '🤵‍♂️',
        description: 'Elite 24-hour butler service for your entire voyage.',
        code: 'GOLDENBUTLER'
    },
    'Wellness Voyager': {
        id: 'golden-spa',
        title: 'Private Spa Sanctuary',
        icon: '🧖',
        description: 'Exclusive 2-hour private use of the Thermal Spa suite.',
        code: 'GOLDENSPA'
    },
    'Social Foodie': {
        id: 'golden-chef',
        title: "Chef's Table Experience",
        icon: '👨‍🍳',
        description: 'A private multi-course dinner with the executive chef.',
        code: 'GOLDENCHEF'
    },
    'Family Planner': {
        id: 'golden-arcade',
        title: 'VIP Family Pass',
        icon: '🕹️',
        description: 'Unlimited access to all gaming and arcade zones for the whole family.',
        code: 'GOLDENFAMILY'
    },
    'Culture Seeker': {
        id: 'golden-tour',
        title: 'Private Old Town Tour',
        icon: '🏰',
        description: 'A dedicated historian-led tour of Old Town Dubrovnik.',
        code: 'GOLDENTOUR'
    },
    'Social Storyteller': {
        id: 'golden-photo',
        title: 'Professional Photo Shoot',
        icon: '📸',
        description: 'A private photographer for your scenic moments.',
        code: 'GOLDENPHOTO'
    },
    'Work from Sea': {
        id: 'golden-work',
        title: 'Premium Work Station',
        icon: '💻',
        description: 'Priority satellite bandwidth and dedicated lounge desk.',
        code: 'GOLDENWORK'
    },
    'The Alchemist': {
        id: 'golden-cocktail',
        title: 'Mixology Masterclass',
        icon: '🍸',
        description: 'Learn the secrets of our lead mixologist privately.',
        code: 'GOLDENMIX'
    }
};

/**
 * Calculate discount based on "Exclusive Package" completion.
 * Note: Points from coins/medals do NOT count towards this tier.
 * @param {Object} loyaltyPrograms - The state of loyalty program matches
 * @param {Array} backpack - The current backpack items
 * @returns {number} 0, 5, or 10
 */
export const calculateLiveOfferDiscount = (loyaltyPrograms, backpack) => {
    // Promo B (Status Match) = 10%
    const isStatusMatchComplete = Object.values(loyaltyPrograms).some(v => v === true);
    if (isStatusMatchComplete) return 10;

    // Promo A (Milestone - e.g. 1 activity per experience or 5 items total) = 5%
    const activityCount = backpack.filter(item => item.type === 'activity' || item.type === 'reward').length;
    if (activityCount >= 3) return 5;

    return 0;
};
