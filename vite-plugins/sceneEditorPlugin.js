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
                        const { companyId, config } = data;

                        console.log(`[Plugin] Global Save Request for ${companyId}`);

                        if (!companyId || !config) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'Missing companyId or config' }));
                            return;
                        }

                        // Path to the JSON truth
                        const truthPath = path.resolve(__dirname, '../src/data/config_truth.json');
                        
                        // Load current truth
                        let masterTruth = {};
                        if (fs.existsSync(truthPath)) {
                            masterTruth = JSON.parse(fs.readFileSync(truthPath, 'utf-8'));
                        }

                        // Update the specific company's truth
                        // We treat the incoming config as the NEW baseline truth for that company
                        masterTruth[companyId] = config;

                        // Write back elegantly formatted
                        fs.writeFileSync(truthPath, JSON.stringify(masterTruth, null, 4), 'utf-8');

                        console.log(`%c[Plugin] 🚀 MASTER TRUTH UPDATED for ${companyId}`, 'color: #00ff00; font-weight: bold;');

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            success: true,
                            message: `Global Truth updated for ${companyId}. Local file overwritten.`
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
