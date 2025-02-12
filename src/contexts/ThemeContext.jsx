import { createContext, useContext, useMemo } from 'react';
import { useThemeDetection } from '../hooks/useThemeDetection';

const ThemeContext = createContext({
  theme: 'light',
  telegramTheme: 'light',
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const { theme, telegramTheme, setTheme } = useThemeDetection();

  const value = useMemo(() => ({
    theme,
    telegramTheme,
    setTheme,
  }), [theme, telegramTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
