import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isNeon: false,
  isDark: false,
  toggleNeon: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('jobhive_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('neon-theme', 'dark-theme');

    if (theme === 'neon') {
      root.classList.add('neon-theme');
      root.setAttribute('data-theme', 'neon');
    } else if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }

    try {
      localStorage.setItem('jobhive_theme', theme);
    } catch (_) {}
  }, [theme]);

  const toggleNeon = () => {
    setThemeState((prev) => (prev === 'neon' ? 'light' : 'neon'));
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isNeon: theme === 'neon',
        isDark: theme === 'dark',
        toggleNeon,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
