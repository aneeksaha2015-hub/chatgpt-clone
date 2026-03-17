import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/theme.css'
import './styles/global.css'
import './styles/auth.css'
import './styles/themeToggle.css'
import './App.css'

import App from './App.jsx'
import ThemeManager from './utils/themeManager.js'

ThemeManager.initialize()
ThemeManager.watchSystemPreference()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)