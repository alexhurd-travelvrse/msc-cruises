import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * msc-cruises Standalone Master Config
 * Merged for maximum stability on Node.js v24 / Vite 7 / Windows
 */

// --- SCENE EDITOR PLUGIN LOGIC ---
const sceneEditorPlugin = () => ({
  name: 'scene-editor-plugin',
  configureServer(server) {
    server.middlewares.use('/api/save-config', async (req, res) => {
      if (req.method !== 'POST') { 
        res.statusCode = 405; 
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method Not Allowed' })); 
        return; 
      }
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const truthPath = path.resolve(__dirname, './src/data/config_truth.json');
          let masterTruth = {};
          if (fs.existsSync(truthPath)) masterTruth = JSON.parse(fs.readFileSync(truthPath, 'utf-8'));

          // Support for direct scene editor saves (no nesting)
          if (parsed.experienceId && parsed.objects) {
             const expId = parsed.experienceId;
             if (masterTruth.experiences && masterTruth.experiences[expId]) {
                 const exp = masterTruth.experiences[expId];
                 parsed.objects.forEach(obj => {
                     if (obj.id === 'camera' || obj.name === 'Initial Camera Position') {
                         exp.startPos = obj.pos;
                         exp.startRot = obj.rot;
                     } else if (obj.id === 'coin' || (exp.coin && obj.id === exp.coin.id) || obj.id.startsWith('special-')) {
                         if (!exp.coin) exp.coin = {};
                         exp.coin.position = obj.pos;
                         exp.coin.rotation = obj.rot;
                     } else if (obj.id === 'activity' || obj.id === 'remote' || obj.id.match(/^(item-)?\d+-\d+$/)) {
                         // Find item in items array by id or default index
                         const itemIdx = exp.items ? exp.items.findIndex(i => i.id === obj.id) : -1;
                         if (itemIdx !== -1) {
                             exp.items[itemIdx].position = obj.pos;
                             exp.items[itemIdx].rotation = obj.rot;
                              if (obj.discoveryMode) exp.items[itemIdx].discoveryMode = obj.discoveryMode;
                              if (obj.audioUrl) {
                                  if (!exp.items[itemIdx].collectible) exp.items[itemIdx].collectible = {};
                                  exp.items[itemIdx].collectible.url = obj.audioUrl;
                                  exp.items[itemIdx].collectible.type = 'mp3';
                              }
                         } else {
                             // Fallback for named IDs like 'activity' or 'remote' to indices 0 and 1
                             const fallbackIdx = (obj.id === 'remote') ? 0 : (obj.id === 'activity' ? 1 : -1);
                             if (fallbackIdx !== -1 && exp.items && exp.items[fallbackIdx]) {
                                 exp.items[fallbackIdx].position = obj.pos;
                                 exp.items[fallbackIdx].rotation = obj.rot;
                                  if (obj.discoveryMode) exp.items[fallbackIdx].discoveryMode = obj.discoveryMode;
                                  if (obj.audioUrl) {
                                      if (!exp.items[fallbackIdx].collectible) exp.items[fallbackIdx].collectible = {};
                                      exp.items[fallbackIdx].collectible.url = obj.audioUrl;
                                      exp.items[fallbackIdx].collectible.type = 'mp3';
                                  }
                             }
                         }
                     } else if (obj.id.startsWith('extra-')) {
                         const idx = parseInt(obj.id.split('-')[1]);
                         if (exp.extraObjects && exp.extraObjects[idx]) {
                             exp.extraObjects[idx].pos = obj.pos;
                             exp.extraObjects[idx].rot = obj.rot;
                         }
                     }
                 });
             }
          }
          
          if (parsed.config && Object.keys(parsed.config).length > 0) {
              console.log("[Vite API] Received full configuration payload from Dashboard, replacing master truth disk file.");
              masterTruth = parsed.config;
          }

          fs.writeFileSync(truthPath, JSON.stringify(masterTruth, null, 4), 'utf-8');
          res.statusCode = 200; res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) { 
          console.error("Save error:", e);
          res.statusCode = 500; 
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message })); 
        }
      });
    });
    server.middlewares.use('/api/git-sync', async (req, res) => {
      exec('git add . && git commit -m "UI: Master Truth Sync" && git push', (error) => {
        res.setHeader('Content-Type', 'application/json');
        if (error) { 
          res.statusCode = 500; 
          res.end(JSON.stringify({ error: error.message })); 
          return; 
        }
        res.statusCode = 200; 
        res.end(JSON.stringify({ success: true }));
      });
    });
  }
});

// --- VOICEOVER PLUGIN LOGIC ---
const voiceoverPlugin = () => ({
  name: 'voiceover-plugin',
  configureServer(server) {
    server.middlewares.use('/api/save-audio', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return; }
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { companyId, audioKey, audioData } = JSON.parse(body);
          const audioDir = path.resolve(__dirname, './public/audio');
          if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
          const fileName = `${companyId}_${audioKey}_${Date.now()}.wav`;
          const filePath = path.join(audioDir, fileName);
          fs.writeFileSync(filePath, audioData.replace(/^data:audio\/\w+;base64,/, ""), 'base64');
          const manifestPath = path.resolve(__dirname, './src/data/voiceoverManifest.json');
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          if (!manifest[companyId]) manifest[companyId] = {};
          manifest[companyId][audioKey] = `/audio/${fileName}`;
          fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
          res.statusCode = 200; 
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, path: `/audio/${fileName}` }));
        } catch (e) { 
          res.statusCode = 500; 
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message })); 
        }
      });
    });
  }
});

export default defineConfig({
  plugins: [react(), sceneEditorPlugin(), voiceoverPlugin()],
  server: {
    allowedHosts: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0 
  },
  resolve: {
    alias: {
      react: 'react',
      'react-dom': 'react-dom'
    }
  }
})
