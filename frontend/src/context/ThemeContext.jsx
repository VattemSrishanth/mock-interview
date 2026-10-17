import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme === 'aurora') return 'cyberpunk';
      if (['dark', 'light', 'cyberpunk'].includes(savedTheme)) return savedTheme;
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

  const toggleTheme = () => {
    setTheme((prev) => ({ dark: 'light', light: 'cyberpunk', cyberpunk: 'dark' })[prev] || 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLight: theme === 'light' }}>
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

