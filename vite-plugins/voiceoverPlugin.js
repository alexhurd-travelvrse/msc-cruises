import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function voiceoverPlugin() {
    return {
        name: 'voiceover-plugin',
        configureServer(server) {
            server.middlewares.use('/api/save-audio', async (req, res) => {
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
                        const { companyId, audioKey, audioData } = data;

                        if (!companyId || !audioKey || !audioData) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'Missing companyId, audioKey, or audioData' }));
                            return;
                        }

                        // 1. Save the audio file to public/audio
                        const audioDir = path.resolve(__dirname, '../public/audio');
                        if (!fs.existsSync(audioDir)) {
                            fs.mkdirSync(audioDir, { recursive: true });
                        }

                        const fileName = `${companyId}_${audioKey}_${Date.now()}.wav`;
                        const filePath = path.join(audioDir, fileName);
                        
                        // Strip the data:audio/wav;base64, prefix
                        const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, "");
                        fs.writeFileSync(filePath, base64Data, 'base64');

                        const publicPath = `/audio/${fileName}`;

                        // 2. Update the manifest
                        const manifestPath = path.resolve(__dirname, '../src/data/voiceoverManifest.json');
                        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

                        if (!manifest[companyId]) {
                            manifest[companyId] = {};
                        }

                        // Cleanup old file if exists in manifest
                        const oldPath = manifest[companyId][audioKey];
                        if (oldPath && oldPath.startsWith('/audio/')) {
                            const oldFilePath = path.join(__dirname, '../public', oldPath);
                            if (fs.existsSync(oldFilePath)) {
                                fs.unlinkSync(oldFilePath);
                            }
                        }

                        manifest[companyId][audioKey] = publicPath;
                        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            success: true,
                            path: publicPath
                        }));

                    } catch (error) {
                        console.error('Error saving audio:', error);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
            });
        }
    };
}
