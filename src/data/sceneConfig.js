const activeCompany = import.meta.env.VITE_ACTIVE_COMPANY || 'msc-cruises';

const mscConfig = {
    "1": {
        name: 'Yacht Club Owner\'s Suite',
        modelPath: '/models/1.splat',
        modelRotation: [Math.PI, 0, 0],
        startPos: [-0.881, -0.928, 0.191],
        startRot: [2.015, -0.747, 2.182],
        scale: 1,
        coinPos: [0.760, 0.790, 1.310],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0.341, -0.287, -0.036],
        activityRot: [-0.575, 0.582, 0.782],
        coinSize: 0.4,
        activitySize: 0.04,
        coinTexturePath: '/textures/coin.png',
        activityModelPath: '/models/conciergebell3.glb',
        boundaries: [],
        remotePos: [0.380, 0.391, -0.594],
        remoteRot: [0.000, 0.000, 0.000],
        remoteSize: 0.1,
        remoteModelPath: '/models/remotecontrol.glb',
        avatarPos: [0.353, -0.527, 0.142],
        avatarRot: [0.988, -0.146, 1.003],
        lightingIntensity: 2.0,
        lightColor: '#ff9d00', // Golden sunset
        shadowOpacity: 0.6,
        hotspots: [
            { pos: [-0.881, -0.928, 0.191], label: 'Suite Entrance' },
            { pos: [0.5, -0.8, 1.2], label: 'Balcony View' },
            { pos: [-0.5, -0.8, -1.0], label: 'Bedroom Area' }
        ],
        extraObjects: [
            {
                name: 'YachtClubStar',
                pos: [1.129, 1.865, 0.740],
                rot: [1.815, -0.445, 2.096],
                size: 0.08,
                type: 'star'
            }
        ]
    },
    "2": {
        name: 'Luxurious MSC Aurea Spa',
        modelPath: '/models/spa.splat',
        modelRotation: [0, 0, 0],
        startPos: [-0.937, 0.560, -0.554],
        startRot: [0.114, -0.906, 0.090],
        scale: 1.0,
        coinPos: [0.6, 1.2, -3.5],
        coinRot: [0, 0, 0],
        activityPos: [-0.6, 1.2, -3.5],
        coinSize: 0.6,
        activitySize: 0.4,
        boundaries: [],
        avatarPos: [-0.140, -1.319, 0.374],
        lightingIntensity: 1.5,
        lightColor: '#b2f7ff',
        shadowOpacity: 0.4,
        extraObjects: [
            { type: 'coin', pos: [-3.119, -0.272, -1.211], name: 'SpeakeasyCoin' },
            { name: 'GymBall', pos: [2.0, 0.5, -1.5], size: 0.4, type: 'gymball' }
        ],
        hotspots: [
            { pos: [-0.937, 0.560, -0.554], label: 'Spa Entrance' },
            { pos: [1.5, 0.5, -0.5], label: 'Pool Side' },
            { pos: [-2.0, 0.5, -2.5], label: 'Sauna Area' }
        ]
    },
    "3": {
        name: 'Hola! Tacos & Cantina',
        modelPath: '/models/hola.splat',
        modelRotation: [0, 0, 0],
        startPos: [-0.862, 1.642, -0.201],
        startRot: [-0.234, -0.066, -0.016],
        scale: 1.0,
        coinPos: [0.5, 1.5, 0.5],
        coinRot: [0, 0, 0],
        activityPos: [0, 1.5, 0],
        coinSize: 0.4,
        activitySize: 0.3,
        boundaries: [],
        avatarPos: [-0.140, -1.319, 0.374],
        lightingIntensity: 1.8,
        lightColor: '#ffd27f', // Warm indoor amber
        shadowOpacity: 0.7,
        menuPos: [-0.134, 0.109, -1.768],
        winePos: [0.35, 0.05, -1.3],
        extraObjects: [
            { type: 'coin', pos: [-1.546, 0.131, -1.010], name: 'RestaurantSpeakeasyCoin' }
        ],
        hotspots: [
            { pos: [-0.862, 1.642, -0.201], label: 'Bar Entrance' },
            { pos: [0.5, 1.5, -1.0], label: 'Table Seating' },
            { pos: [-1.2, 1.5, -2.5], label: 'Kitchen View' }
        ]
    },
    "4": {
        name: 'MSC Formula Racer',
        modelPath: '/models/arcade.splat',
        modelRotation: [Math.PI, 0, 0],
        startPos: [0.856, 0.806, 0.022],
        startRot: [0.000, 0.000, 0.000],
        scale: 1.0,
        coinPos: [2.5, 1.2, -1.0],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0.856, 1.124, -2.237],
        activityRot: [0.482, 0.000, 0.000],
        coinSize: 0.6,
        activitySize: 0.25,
        activityTexturePath: '/models/racecarsimulator.jpg',
        racingModelPath: '/models/racingcar.glb',
        boundaries: [],
        avatarPos: [-0.140, -1.319, 0.374],
        lightingIntensity: 1.5,
        lightColor: '#b2f7ff',
        shadowOpacity: 0.5,
        hotspots: [
            { pos: [0.856, 0.806, 0.022], label: 'Track Entrance' },
            { pos: [2.0, 1.0, -1.5], label: 'Simulator Bay' },
            { pos: [-1.0, 1.0, -2.5], label: 'Viewing Area' }
        ]
    },
    "5": {
        name: 'Excursion Spot',
        modelPath: '/models/park.splat',
        modelRotation: [0, 0, 0],
        startPos: [0.173, 1.060, 1.551],
        startRot: [-0.042, 0.720, 0.028],
        scale: 1.0,
        coinPos: [0.173, 1.2, 0.5],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0, 1.2, -2.5],
        avatarPos: [-0.140, -1.319, 0.374],
        avatarTexture: '/textures/brett_casual.png',
        coinSize: 0.6,
        activitySize: 0.4,
        boundaries: [],
        lightingIntensity: 2.0,
        lightColor: '#ffffff',
        shadowOpacity: 0.5,
        hotspots: [
            { pos: [0.000, 1.052, 1.354], label: 'Square Entrance' },
            { pos: [1.2, 1.2, -1.5], label: 'Gaudi Sculpture' },
            { pos: [-1.5, 1.2, -3.0], label: 'Tower View' }
        ]
    },
    "6": {
        name: 'Ocean View',
        modelPath: '/models/1.splat',
        modelRotation: [Math.PI, 0, 0],
        startPos: [0, 2, 5],
        startRot: [0, 0, 0],
        scale: 1.0,
        coinPos: [0, 2.5, 4],
        coinRot: [0, 0, 0],
        activityPos: [-0.5, 2.5, 4],
        coinSize: 0.4,
        activitySize: 0.1,
        boundaries: [],
        lightingIntensity: 1.2,
        lightColor: '#ffffff'
    },
    "default": {
        modelPath: '/models/1.splat',
        startPos: [0, 2, 5],
        startRot: [0, 0, 0],
        coinPos: [0.760, 0.790, 1.310],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0.341, -0.287, -0.036]
    }
};

const sunGardensConfig = {
    "1": {
        name: 'Sea View Residence',
        modelPath: '/models/SunGardenshotelwithbalcony.spz',
        modelRotation: [0, 0, 0], // SPZ often needs 0 rot
        startPos: [-0.182, -0.783, 0.103], // Verify if these work for the new model
        startRot: [1.672, -0.426, 1.812],
        scale: 1,
        coinPos: [0.760, 0.790, 1.310],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0.341, -0.287, -0.036],
        activityRot: [-0.575, 0.582, 0.782],
        coinSize: 0.4,
        activitySize: 0.04,
        coinTexturePath: '/textures/coin.png',
        activityTexturePath: '/models/conciergebell3.glb', // Fallback or specific
        boundaries: [],
        avatarPos: [0.353, -0.527, 0.142],
        lightingIntensity: 1.5,
        lightColor: '#ffffff'
    },
    "2": {
        name: 'Luxurious Spa with Celestial Ceiling',
        modelPath: '/models/Luxurious Spa with Celestial Ceiling.spz',
        modelRotation: [0, 0, 0],
        startPos: [-0.937, 0.560, -0.554],
        startRot: [0.114, -0.906, 0.090],
        scale: 1.0,
        coinPos: [-0.630, 1.050, -1.340],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0.0, 1.2, -2.0],
        activityRot: [0.114, -0.906, 0.090],
        coinSize: 0.6,
        activitySize: 0.25,
        coinTexturePath: '/textures/coin.png',
        activityTexturePath: '/models/spa.jpg',
        boundaries: [],
        lightingIntensity: 1.5,
        lightColor: '#b2f7ff',
        extraObjects: [
            {
                name: 'GymBall',
                pos: [1.5, 1.2, -2.0],
                rot: [0, 0, 0],
                size: 0.25,
                type: 'gym_ball'
            }
        ]
    },
    "3": {
        name: 'Sunset Terrace', // Different name for Sun Gardens
        modelPath: '/models/holarestaurantv5.spz', // Reuse for now unless there's a specific one
        modelRotation: [0, 0, 0],
        startPos: [0.098, 0.116, 0.318],
        startRot: [0.084, 0.589, -0.047],
        scale: 1.0,
        coinPos: [0.5, 1.2, -1.5],
        coinRot: [-0.831, -0.508, -0.490],
        menuPos: [-1.5, 1.2, -1.5],
        menuRot: [0.084, 0.589, -0.047],
        activityPos: [-0.5, 1.2, -1.5],
        coinSize: 0.4,
        activitySize: 0.3,
        coinTexturePath: '/textures/coin.png',
        activityTexturePath: '/textures/coin.png',
        boundaries: [],
        lightingIntensity: 1.8,
        lightColor: '#ffd27f'
    },
    "4": {
        name: 'Sports Centre',
        modelPath: '/models/Vibrant Indoor Bumper Car Arena.splat', // Reuse
        modelRotation: [Math.PI, 0, 0],
        startPos: [0.856, 0.806, 0.022],
        startRot: [0.000, 0.000, 0.000],
        scale: 1.0,
        coinPos: [2.5, 1.2, -1.0],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0.856, 1.124, -2.237],
        activityRot: [0.482, 0.000, 0.000],
        coinSize: 0.6,
        activitySize: 0.25,
        activityTexturePath: '/models/racecarsimulator.jpg',
        racingModelPath: '/models/racingcar.glb',
        boundaries: [],
        lightingIntensity: 1.5,
        lightColor: '#b2f7ff'
    },
    "5": {
        name: 'Old Town Tour',
        modelPath: '/models/Park Güell Architectural Details.splat',
        modelRotation: [0, 0, 0],
        startPos: [0.173, 1.060, 1.551],
        startRot: [-0.042, 0.720, 0.028],
        scale: 1.0,
        coinPos: [0.173, 1.2, 0.5],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0, 1.2, -2.5],
        avatarPos: [-0.140, -1.319, 0.374],
        avatarTexture: '/textures/brett_casual.png',
        coinSize: 0.6,
        activitySize: 0.4,
        boundaries: [],
        lightingIntensity: 2.0,
        lightColor: '#ffffff',
        shadowOpacity: 0.5
    },
    "6": {
        name: 'Adriatic View',
        modelPath: '/models/1.splat',
        modelRotation: [Math.PI, 0, 0],
        startPos: [0, 2, 5],
        startRot: [0, 0, 0],
        scale: 1.0,
        coinPos: [0, 2.5, 4],
        coinRot: [0, 0, 0],
        activityPos: [-0.5, 2.5, 4],
        coinSize: 0.4,
        activitySize: 0.1,
        boundaries: [],
        lightingIntensity: 1.2,
        lightColor: '#ffffff'
    },
    "default": {
        modelPath: '/models/SunGardenshotelwithbalcony.spz',
        startPos: [0, 2, 5],
        startRot: [0, 0, 0],
        coinPos: [0.760, 0.790, 1.310],
        coinRot: [0.000, 0.000, 0.000],
        activityPos: [0.341, -0.287, -0.036]
    }
};

export const sceneConfig = activeCompany === 'sun-gardens' ? sunGardensConfig : mscConfig;
