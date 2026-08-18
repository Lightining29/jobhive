import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isNeon: false,
  isDark: false,
  toggleNeon: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('neon-theme', 'dark-theme');
    root.setAttribute('data-theme', 'light');
    try {
      localStorage.removeItem('jobhive_theme');
    } catch (_) {}
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        isNeon: false,
        isDark: false,
        toggleNeon: () => {},
        setTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
