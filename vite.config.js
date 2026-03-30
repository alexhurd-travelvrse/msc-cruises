import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sceneEditorPlugin from './vite-plugins/sceneEditorPlugin.js'
import voiceoverPlugin from './vite-plugins/voiceoverPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sceneEditorPlugin(), voiceoverPlugin()],
  server: {
    allowedHosts: 'all',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  preview: {
    allowedHosts: 'all',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0 // Avoid inlining big splat blobs
  },
  resolve: {
    alias: {
      react: 'react',
      'react-dom': 'react-dom'
    }
  }
})
