import { useState, useEffect, useCallback } from 'react';
import ThemeManager from '../utils/themeManager';

/**
 * Custom hook for theme management
 * Returns current theme and toggle function
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(ThemeManager.getTheme());

  // Synchronize with DOM changes
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = ThemeManager.getTheme();
      setTheme(newTheme);
    };

    // Listen for storage changes (theme changed in another tab)
    window.addEventListener('storage', handleThemeChange);

    // Also listen for attribute changes on the document element
    const observer = new MutationObserver(() => {
      handleThemeChange();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = ThemeManager.toggleTheme();
    setTheme(newTheme);
  }, []);

  return { theme, toggleTheme };
};

export default useTheme;
