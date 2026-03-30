import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("%c[VRSE] Bundle Version: " + new Date().toISOString(), "color: #00ff00; background: #000; padding: 5px;");

createRoot(document.getElementById('root')).render(
  <App />
)
