import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      if (['dark', 'light'].includes(savedTheme)) return savedTheme;
    } catch {}
    return 'dark'; // default theme
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'aurora', 'cyberpunk');
    root.classList.add(theme);
    try {
      localStorage.setItem('app-theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => prev === 'light' ? 'dark' : 'light');
  }, []);
  const contextValue = useMemo(() => ({ theme, setTheme, toggleTheme, isLight: theme === 'light' }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

