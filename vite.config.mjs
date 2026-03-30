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
          let { companyId, config } = parsed;

          // Legacy support for direct scene editor saves
          if (!companyId && parsed.experienceId && parsed.objects) {
             const truthPath = path.resolve(__dirname, './src/data/config_truth.json');
             let masterTruth = {};
             if (fs.existsSync(truthPath)) masterTruth = JSON.parse(fs.readFileSync(truthPath, 'utf-8'));
             
             companyId = masterTruth['msc-cruises'] ? 'msc-cruises' : (Object.keys(masterTruth)[0] || 'msc-cruises');
             if (masterTruth[companyId] && masterTruth[companyId].experiences && masterTruth[companyId].experiences[parsed.experienceId]) {
                 const exp = masterTruth[companyId].experiences[parsed.experienceId];
                 parsed.objects.forEach(obj => {
                     if (obj.id === 'camera') {
                         exp.startPos = obj.pos;
                         exp.startRot = obj.rot;
                     } else if (obj.id === 'coin' || obj.id === (exp.coin && exp.coin.id)) {
                         if (!exp.coin) exp.coin = {};
                         exp.coin.position = obj.pos;
                         exp.coin.rotation = obj.rot;
                     } else if (obj.id === 'activity') {
                         const idx = exp.items ? exp.items.findIndex(item => item.type === 'bell' || item.type === 'activity' || item.id === '1-1' || item.id === `${parsed.experienceId}-1`) : -1;
                         if (idx !== -1) {
                             exp.items[idx].position = obj.pos;
                             exp.items[idx].rotation = obj.rot;
                         } else if (exp.items && exp.items.length > 0) {
                             exp.items[0].position = obj.pos;
                             exp.items[0].rotation = obj.rot;
                         }
                     } else if (['remote', 'menu', 'wine', 'reward', 'gaudi'].includes(obj.id)) {
                         exp[`${obj.id}Pos`] = obj.pos;
                         exp[`${obj.id}Rot`] = obj.rot;
                     } else if (obj.id && obj.id.startsWith('extra-')) {
                         const idx = parseInt(obj.id.split('-')[1]);
                         if (exp.extraObjects && exp.extraObjects[idx]) {
                             exp.extraObjects[idx].pos = obj.pos;
                             exp.extraObjects[idx].rot = obj.rot;
                         }
                     } else {
                         // Generic fallback for any other named objects directly into extraObjects
                         if (!exp.extraObjects) exp.extraObjects = [];
                         const extraIndex = exp.extraObjects.findIndex(eo => eo.id === obj.id || eo.name === obj.id);
                         if (extraIndex !== -1) {
                             exp.extraObjects[extraIndex].pos = obj.pos;
                             exp.extraObjects[extraIndex].rot = obj.rot;
                         } else {
                             exp.extraObjects.push({ id: obj.id, pos: obj.pos, rot: obj.rot });
                         }
                     }
                 });
                 config = masterTruth[companyId];
             }
          }

          if (!companyId || !config) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing data' })); return; }
          const truthPath = path.resolve(__dirname, './src/data/config_truth.json');
          let masterTruth = {};
          if (fs.existsSync(truthPath)) masterTruth = JSON.parse(fs.readFileSync(truthPath, 'utf-8'));
          masterTruth[companyId] = config;
          fs.writeFileSync(truthPath, JSON.stringify(masterTruth, null, 4), 'utf-8');
          res.statusCode = 200; res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })); }
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
    hmr: { clientPort: 443 },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  preview: {
    allowedHosts: true,
    hmr: { clientPort: 443 }
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
