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
      if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return; }
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const { companyId, config } = JSON.parse(body);
          if (!companyId || !config) { res.statusCode = 400; res.end('Missing data'); return; }
          const truthPath = path.resolve(__dirname, './src/data/config_truth.json');
          let masterTruth = {};
          if (fs.existsSync(truthPath)) masterTruth = JSON.parse(fs.readFileSync(truthPath, 'utf-8'));
          masterTruth[companyId] = config;
          fs.writeFileSync(truthPath, JSON.stringify(masterTruth, null, 4), 'utf-8');
          res.statusCode = 200; res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e) { res.statusCode = 500; res.end(e.message); }
      });
    });
    server.middlewares.use('/api/git-sync', async (req, res) => {
      exec('git add . && git commit -m "UI: Master Truth Sync" && git push', (error) => {
        if (error) { res.statusCode = 500; res.end(error.message); return; }
        res.statusCode = 200; res.end(JSON.stringify({ success: true }));
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
          res.statusCode = 200; res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, path: `/audio/${fileName}` }));
        } catch (e) { res.statusCode = 500; res.end(e.message); }
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
