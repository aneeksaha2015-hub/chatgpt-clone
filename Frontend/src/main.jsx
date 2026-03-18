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

// Lock viewport — prevents layout shift on input focus
const root = document.getElementById('root');
const setHeight = () => {
  root.style.height = `${window.visualViewport.height}px`;
  root.style.top = `${window.visualViewport.offsetTop}px`;
};
setHeight();
window.visualViewport.addEventListener('resize', setHeight);
window.visualViewport.addEventListener('scroll', setHeight);

createRoot(root).render(
  <App />
)