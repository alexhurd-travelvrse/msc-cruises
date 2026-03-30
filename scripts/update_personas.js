import fs from 'fs';
import path from 'path';

const configTruth = JSON.parse(fs.readFileSync('src/data/config_truth.json', 'utf-8'));

configTruth['msc-cruises'].personas = {
    influencerWeights: {
        'Luxury/Travel Blogger': { 'The Sovereign': 20, 'Wellness Voyager': 10 },
        'Family Vlogger': { 'Family Planner': 20 },
        'Foodie Influencer': { 'Social Foodie': 20, 'The Alchemist': 10 },
        'Digital Nomad': { 'Work from Sea': 20, 'Social Storyteller': 10 },
    },
    priorityWeights: { first: 25, second: 20, last: 10 },
    dwellWeights: { minMs: 60000, highPoints: 20, maxMs: 15000, lowPoints: -10 },
    specialOccasionMultipliers: { 'The Sovereign': 1.5, 'The Alchemist': 1.3 },
    firstTimerMultipliers: { 'Culture Seeker': 1.4, 'Work from Sea': 0.8 }
};

fs.writeFileSync('src/data/config_truth.json', JSON.stringify(configTruth, null, 4));
console.log('Personas added to Truth JSON');
