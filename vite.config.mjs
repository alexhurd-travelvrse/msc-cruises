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
          const { companyId, experienceId, objects } = parsed;
          
          // Resolve correct manifest path
          let manifestFile = 'config_truth.json'; // Default legacy
          if (companyId === '25-hours-copenhagen') manifestFile = '25hours_indre.json';
          else if (companyId === 'msc-europa') manifestFile = 'msc_europa.json';
          else if (companyId === 'msc-cruises') manifestFile = 'config_truth.json';

          const truthPath = path.resolve(__dirname, './src/data', manifestFile);
          console.log(`[Vite Editor] Saving to: ${manifestFile} (Company: ${companyId})`);

          if (!fs.existsSync(truthPath)) {
             throw new Error(`Manifest file not found: ${manifestFile}`);
          }

          let masterTruth = JSON.parse(fs.readFileSync(truthPath, 'utf-8'));

          // Support for Whitelabel Manifest Structure (challenge_configuration.experiences)
          if (masterTruth.challenge_configuration) {
              const expIdx = masterTruth.challenge_configuration.experiences.findIndex(e => e.exp_id === experienceId);
              if (expIdx !== -1) {
                  const exp = masterTruth.challenge_configuration.experiences[expIdx];
                  objects.forEach(obj => {
                      if (obj.id.startsWith('item')) {
                          const iconIdx = exp.backpack_icons.findIndex(i => i.id === obj.id);
                          if (iconIdx !== -1) {
                              exp.backpack_icons[iconIdx].coordinates = {
                                  x: obj.pos[0],
                                  y: obj.pos[1],
                                  z: obj.pos[2]
                              };
                          }
                      } else if (obj.id === 'camera') {
                          exp.startPos = obj.pos;
                          exp.startRot = obj.rot;
                      }
                  });
              }
          } 
          // Support for Legacy Structure (experiences[id])
          else if (masterTruth.experiences && masterTruth.experiences[experienceId]) {
              const exp = masterTruth.experiences[experienceId];
              objects.forEach(obj => {
                  if (obj.id === 'camera') {
                      exp.startPos = obj.pos;
                      exp.startRot = obj.rot;
                  } else if (obj.id.startsWith('item') || obj.id.includes('-')) {
                      const itemIdx = exp.items ? exp.items.findIndex(i => i.id === obj.id) : -1;
                      if (itemIdx !== -1) {
                          exp.items[itemIdx].position = obj.pos;
                          exp.items[itemIdx].rotation = obj.rot;
                      }
                  } else if (obj.id.startsWith('special-')) {
                      if (!exp.coin) exp.coin = {};
                      exp.coin.position = obj.pos;
                      exp.coin.rotation = obj.rot;
                  }
              });
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
