import fs from 'fs';
import path from 'path';

// Note: In a real environment, I'd import these. 
// Since I'm an agent, I'll scrape the content from the files I just read.

const mscTruth = {
    "msc-cruises": {
        "home": {
            "title": "MSC World Europa",
            "subtitle": "Take my MSC Challenge",
            "heroImage": "/assets/msc_hero.png",
            "influencerPhoto": "",
            "description": "Join me for an exclusive behind-the-scenes tour of MSC World Europa. Explore the most luxurious suites, relax in the Aurea Spa, and discover hidden gems like Hola! Tacos & Cantina."
        },
        "teleport": {
            "title": "The Promenade",
            "subtitle": "Select your next deck",
            "promoTitle": "Unlock classic membership",
            "promoSubtitle": "Receive a 5% discount on your voyage.",
            "backpackTitle": "Fill your backpack for a unique offer",
            "backpackDesc": "Get an exclusive 10% discount on your voyage if you collect exactly 1 item in every experience."
        },
        "audio": {
            "home": "Welcome aboard the stunning MSC World Europa. I'm Alex Hurd, your digital guide. I've curated this exclusive journey to show you the absolute best of our ship. Tap Enter to begin your tropical escape.",
            "teleport": "The Promenade is where the energy of the ship comes alive. I've highlighted five of my favorite spots below. Where should we head first?",
            "1": "The Yacht Club suite is pure elite luxury. Take a moment to soak in that balcony view—it's my favorite spot for a morning espresso. Don't forget to check the view for your first clue!",
            "2": "The Aurea Spa is a literal sanctuary. The thermal baths here are world-class. Relax, breathe in the salt air, and see if the temperature holds our next secret.",
            "3": "Welcome to Hola! Tacos & Cantina. The vibe here is electric and the margaritas are legendary. Take a look at the menu—it might have just what we need for the next code.",
            "4": "This arcade is a high-tech playground. I'm obsessed with the Formula One simulator! It feels so real. Check your speed—it might be the key to our next milestone.",
            "5": "Our Barcelona excursion is the ultimate culture trip. Gaudí's architecture is like nothing else on earth. Let's find the final piece of the puzzle together in this vibrant city.",
            "completion": "You've done it! You've unlocked the exclusive Speakeasy. Your travel DNA and special rewards are waiting in your backpack. Thanks for exploring with me!"
        },
        "coins": {
            "1": { "title": "Suite Clue", "text": "Check the balcony view for your first digit.", "image": "/models/msc_clue1.jpg" },
            "2": { "title": "Spa Clue", "text": "The temperature of the sauna holds the next digit.", "image": "/models/msc_clue2.jpg" },
            "3": { "title": "Tacos Clue", "text": "How many types of salsa are on the menu?", "image": "/models/msc_clue3.jpg" },
            "4": { "title": "Arcade Clue", "text": "The high score on Pac-Man is your final digit.", "image": "/models/msc_clue4.jpg" },
            "5": { "title": "Excursion Code", "text": "Combine all digits to unlock the vault.", "image": "/models/teleport_qr.png" }
        },
        "experiences": {
            "1": {
                "name": "Yacht Club Owner's Suite",
                "modelPath": "/models/1.splat",
                "modelRotation": [3.14159, 0, 0],
                "startPos": [0, 1.5, 5],
                "startRot": [0, 0, 0],
                "items": [
                    { "id": "1-1", "name": "Luxury Service", "type": "bell", "position": [0.3, 1.2, -1.0], "rotation": [0, 0, 0], "media": "/assets/balcony_preview.jpg", "video": "https://v.ftcdn.net/05/52/63/84/700_F_552638472_vI3K8T5v3Z1r0C7e0R9Jz0QvR9uY6N8t_ST.mp4", "text": "Experience the finest butler service." },
                    { "id": "1-2", "name": "Suite View", "type": "star", "position": [1.129, 1.865, 0.740], "rotation": [1.815, -0.445, 2.096], "media": "/assets/balcony_new.png", "text": "Uninterrupted views of the ocean.", "collectible": { "type": "image", "title": "Sunset Photo Filler", "url": "/models/MSCWorldEuropaswimmingpool.jpg", "description": "A beautiful sunset filler for your photos." } }
                ],
                "coin": { "id": "special-1", "name": "Sovereign Coin", "position": [0, 1.2, -1.5], "media": "/textures/coin.png" },
                "hotspots": [
                    { "pos": [-0.881, -0.928, 0.191], "label": "Suite Entrance" },
                    { "pos": [0.5, -0.8, 1.2], "label": "Balcony View" },
                    { "pos": [-0.5, -0.8, -1.0], "label": "Bedroom Area" }
                ]
            },
            "2": {
                "name": "Luxurious MSC Aurea Spa",
                "modelPath": "/models/spa.splat",
                "modelRotation": [0, 0, 0],
                "startPos": [0, 1.5, 5],
                "startRot": [0, 0, 0],
                "items": [
                    { "id": "2-1", "name": "Thermal Bath", "type": "towel", "position": [0.0, 1.2, -2.0], "media": "/assets/spa_grab.png", "text": "Relax in our celestial thermal waters.", "collectible": { "type": "mp3", "title": "Spa Ambient Mix", "url": "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", "description": "A 5-minute relaxing soundscape from the Aurea Spa." } },
                    { "id": "2-2", "name": "Gym Session", "type": "gymball", "position": [1.5, 1.2, -2.0], "media": "/assets/spa_grab.png", "text": "Energize in our state-of-the-art fitness center." }
                ],
                "coin": { "id": "special-2", "name": "Aurea Coin", "position": [0, 1.2, -1.5], "media": "/textures/coin.png" },
                "hotspots": [
                    { "pos": [-0.937, 0.560, -0.554], "label": "Spa Entrance" },
                    { "pos": [1.5, 0.5, -0.5], "label": "Pool Side" },
                    { "pos": [-2.0, 0.5, -2.5], "label": "Sauna Area" }
                ]
            },
            "3": {
                "name": "Hola! Tacos & Cantina",
                "modelPath": "/models/hola.splat",
                "modelRotation": [0, 0, 0],
                "startPos": [0, 1.5, 5],
                "startRot": [0, 0, 0],
                "items": [
                    { "id": "3-1", "name": "Spicy Taco", "type": "activity", "position": [-0.19, 0.119, -1.313], "media": "/assets/hola_grab.png", "text": "Authentic flavors from Mexico.", "collectible": { "type": "pdf", "title": "Signature Drinks Recipe", "url": "/assets/recipe_placeholder.pdf", "description": "Learn how to make our signature cocktails at home." } },
                    { "id": "3-2", "name": "Fresh Margarita", "type": "wineglass", "position": [-0.374, 0.363, -0.841], "media": "/assets/hola_grab.png", "text": "Hand-crafted at our tequila bar." }
                ],
                "coin": { "id": "special-3", "name": "Hola Coin", "position": [0, 1.2, -1.5], "media": "/textures/coin.png" },
                "hotspots": [
                    { "pos": [-0.862, 1.642, -0.201], "label": "Bar Entrance" },
                    { "pos": [0.5, 1.5, -1.0], "label": "Table Seating" },
                    { "pos": [-1.2, 1.5, -2.5], "label": "Kitchen View" }
                ]
            },
            "4": {
                "name": "MSC Formula Racer",
                "modelPath": "/models/arcade.splat",
                "modelRotation": [3.14159, 0, 0],
                "startPos": [0.856, 0.806, 0.022],
                "startRot": [0, 0, 0],
                "items": [
                    { "id": "4-1", "name": "Simulator Dash", "type": "car", "position": [0.856, 1.124, -2.237], "media": "/assets/arcade_grab.png", "text": "Feel the G-force of a Formula 1 car.", "collectible": { "type": "badge", "title": "3D Gamer Badge", "url": "/models/racingcar.glb", "description": "A special 3D trophy for your racing performance." } },
                    { "id": "4-2", "name": "Arcade Pass", "type": "remote", "position": [2.5, 1.2, -1.0], "media": "/assets/arcade_grab.png", "text": "Unlimited access to retro classics." }
                ],
                "coin": { "id": "special-4", "name": "Speed Coin", "position": [2.5, 1.2, -1], "media": "/textures/coin.png" },
                "hotspots": [
                    { "pos": [0.856, 0.806, 0.022], "label": "Track Entrance" },
                    { "pos": [2.0, 1.0, -1.5], "label": "Simulator Bay" },
                    { "pos": [-1.0, 1.0, -2.5], "label": "Viewing Area" }
                ]
            },
            "5": {
                "name": "Excursion Spot",
                "modelPath": "/models/park.splat",
                "modelRotation": [0, 0, 0],
                "startPos": [0.173, 1.06, 1.551],
                "startRot": [-0.042, 0.72, 0.028],
                "items": [
                    { "id": "5-1", "name": "Gaud\u00ed Inspiration", "type": "ring", "position": [0, 1.2, -2.5], "media": "/assets/excursion_filler.jpg", "video": "https://v.ftcdn.net/06/17/84/44/700_F_617844445_h8vX0BvL4v3Y6H8H1Z8B1v8v8v8v8v8v_ST.mp4", "text": "Discover the architectural genius of Antoni Gaud\u00ed." },
                    { "id": "5-2", "name": "Park Panorama", "type": "star", "position": [1.2, 1.2, -1.5], "media": "/assets/excursion_filler.jpg", "text": "Breathtaking views of the city from Park G\u00fcell.", "collectible": { "type": "pdf", "title": "Hidden City Tips", "url": "/assets/tips_placeholder.pdf", "description": "Exclusive insider tips for exploring Barcelona like a local." } }
                ],
                "coin": { "id": "special-5", "name": "Elite Coin", "position": [0.173, 1.2, 0.5], "media": "/textures/coin.png" },
                "hotspots": [
                    { "pos": [0, 1.052, 1.354], "label": "Square Entrance" },
                    { "pos": [1.2, 1.2, -1.5], "label": "Gaudi Sculpture" },
                    { "pos": [-1.5, 1.2, -3.0], "label": "Tower View" }
                ]
            }
        }
    }
};

const outputDir = path.resolve('c:/Users/Student/.gemini/antigravity/scratch/msc-cruises/src/data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(path.join(outputDir, 'config_truth.json'), JSON.stringify(mscTruth, null, 4));
console.log('Master Truth JSON created successfully at src/data/config_truth.json');
