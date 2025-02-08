import { createContext, useContext, useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';

const ThemeContext = createContext({
  theme: 'light',
  telegramTheme: 'light',
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const { webApp } = useTelegram();
  const [theme, setTheme] = useState('light');
  const [telegramTheme, setTelegramTheme] = useState('light');

  useEffect(() => {
    // Function to detect and set theme
    const detectTheme = () => {
      // Get Telegram theme
      if (webApp?.colorScheme) {
        setTelegramTheme(webApp.colorScheme);
        // Set data attribute for Telegram theme
        document.documentElement.setAttribute('data-telegram-theme', webApp.colorScheme);
      }

      // Set our app theme based on Telegram theme
      const newTheme = webApp?.colorScheme || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Initial theme detection
    detectTheme();

    // Listen for Telegram theme changes
    if (webApp) {
      webApp.onEvent('themeChanged', detectTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      if (!webApp?.colorScheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    mediaQuery.addListener(handleThemeChange);

    return () => {
      mediaQuery.removeListener(handleThemeChange);
      if (webApp) {
        webApp.offEvent('themeChanged', detectTheme);
      }
    };
  }, [webApp]);

  const value = {
    theme,
    telegramTheme,
    setTheme: (newTheme) => {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    },
  };

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
