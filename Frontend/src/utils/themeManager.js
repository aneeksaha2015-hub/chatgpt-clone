export const ThemeManager = {
  getTheme: () => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  },

  setTheme: (theme) => {
    const root = document.documentElement;
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      console.log('[Theme] Set to DARK mode');
    } else {
      root.setAttribute('data-theme', 'light');
      console.log('[Theme] Set to LIGHT mode');
    }
  },

  toggleTheme: () => {
    const current = ThemeManager.getTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    console.log('[Theme] Toggling from', current, 'to', newTheme);
    ThemeManager.setTheme(newTheme);
    return newTheme;
  },

  initialize: () => {
    console.log('[Theme] Initializing...');
    const theme = ThemeManager.getTheme();
    ThemeManager.setTheme(theme);
  },

  watchSystemPreference: () => {
    if (!window.matchMedia) return;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        const newTheme = e.matches ? 'dark' : 'light';
        console.log('[Theme] System preference changed to:', newTheme);
        ThemeManager.setTheme(newTheme);
      }
    });
  },
};

export default ThemeManager;