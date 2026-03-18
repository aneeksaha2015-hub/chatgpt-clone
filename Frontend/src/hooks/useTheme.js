import { useState, useEffect, useCallback } from 'react';
import ThemeManager from '../utils/themeManager';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => ThemeManager.getTheme());

  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = ThemeManager.getTheme();
      setTheme(newTheme);
    };

    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = ThemeManager.toggleTheme();
    setTheme(newTheme);
  }, []);

  return { theme, toggleTheme };
};

export default useTheme;