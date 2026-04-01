import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function sceneEditorPlugin() {
    return {
        name: 'scene-editor-plugin',
        configureServer(server) {
            server.middlewares.use('/api/save-config', async (req, res) => {
                if (req.method !== 'POST') {
                    res.statusCode = 405;
                    res.end('Method Not Allowed');
                    return;
                }

                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const { companyId, experienceId, objects, config } = data;

                        console.log(`[Plugin] Save Request: ${experienceId ? `Exp ${experienceId}` : `Company ${companyId}`}`);

                        // Path to the JSON truth
                        const truthPath = path.resolve(__dirname, '../src/data/config_truth.json');
                        
                        // Load current truth
                        let masterTruth = {};
                        if (fs.existsSync(truthPath)) {
                            masterTruth = JSON.parse(fs.readFileSync(truthPath, 'utf-8'));
                        }

                        if (experienceId && objects) {
                            // Target: Updating specific objects inside an experience
                            console.log(`[Plugin] 🎯 Updating ${objects.length} objects for Experience ${experienceId}`);
                            
                            // Find the experience in the truth
                            if (!masterTruth.experiences) masterTruth.experiences = {};
                            if (!masterTruth.experiences[experienceId]) masterTruth.experiences[experienceId] = { name: `Exp ${experienceId}`, items: [], extraObjects: [] };
                            
                            const exp = masterTruth.experiences[experienceId];

                            objects.forEach(newObj => {
                                // 1. Check for Camera
                                if (newObj.id === 'camera' || newObj.id === 'startPos') {
                                    exp.startPos = newObj.pos;
                                    exp.startRot = newObj.rot;
                                } 
                                // 2. Check for Coin
                                else if (newObj.id === 'coin' || newObj.id.startsWith('special-')) {
                                    if (!exp.coin) exp.coin = {};
                                    exp.coin.position = newObj.pos;
                                    exp.coin.rotation = newObj.rot;
                                }
                                // 3. Check for specific Items (1-1, 1-2, etc)
                                else if (newObj.id.includes('-')) {
                                    if (!exp.items) exp.items = [];
                                    const itemIdx = exp.items.findIndex(i => i.id === newObj.id);
                                    if (itemIdx !== -1) {
                                        exp.items[itemIdx].position = newObj.pos;
                                        exp.items[itemIdx].rotation = newObj.rot;
                                    }
                                }
                                // 4. Check for Extra Objects
                                else if (newObj.id.startsWith('extra-')) {
                                    const extraIdx = parseInt(newObj.id.split('-')[1]);
                                    if (exp.extraObjects && exp.extraObjects[extraIdx]) {
                                        exp.extraObjects[extraIdx].pos = newObj.pos;
                                        exp.extraObjects[extraIdx].rot = newObj.rot;
                                    }
                                }
                            });
                        } else if (config) {
                            // Target: Full Admin Dashboard update
                            console.log("[Plugin] 🚀 Applying full config update from Dashboard");
                            masterTruth = { ...masterTruth, ...config };
                        }

                        // Write back elegantly formatted
                        fs.writeFileSync(truthPath, JSON.stringify(masterTruth, null, 4), 'utf-8');

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            success: true,
                            message: `Truth updated on disk. GitHub Desktop is ready.`
                        }));

                    } catch (error) {
                        console.error('Error saving global truth:', error);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
            });

            server.middlewares.use('/api/git-sync', async (req, res) => {
                console.log("[Plugin] 🚀 GI-SYNC TRIGGERED. Preparing to ship to production...");

                exec('git add . && git commit -m "Automated Content/Scene Update" && git push', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`[GitSync Error]: ${error.message}`);
                        res.statusCode = 500;
                        res.end(JSON.stringify({ success: false, error: error.message }));
                        return;
                    }
                    console.log(`[GitSync Output]: ${stdout}`);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, message: "Pushed to GitHub. Vercel deployment started." }));
                });
            });
        }
    };
}
