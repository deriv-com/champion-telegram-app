import { useEffect, useState } from 'react';
import { useTelegram } from './useTelegram';

// Key for storing user's theme preference
const USER_THEME_PREFERENCE = 'user-theme-preference';

// Utility function to safely set document attributes
const setDocumentAttribute = (attribute, value) => {
  try {
    document.documentElement.setAttribute(attribute, value);
  } catch (error) {
    console.error(`Failed to set document attribute ${attribute}:`, error);
  }
};

export const useThemeDetection = () => {
  const { webApp } = useTelegram();
  const [theme, setTheme] = useState(() => {
    // Check for saved user preference first
    const savedTheme = localStorage.getItem(USER_THEME_PREFERENCE);
    return savedTheme || 'light';
  });
  const [telegramTheme, setTelegramTheme] = useState('light');
  const [hasUserPreference, setHasUserPreference] = useState(() => {
    return !!localStorage.getItem(USER_THEME_PREFERENCE);
  });

  useEffect(() => {
    // Function to detect and set theme
    const detectTheme = () => {
      // Get Telegram theme
      if (typeof webApp?.colorScheme === 'string') {
        setTelegramTheme(webApp.colorScheme);
        setDocumentAttribute('data-telegram-theme', webApp.colorScheme);
      }

      // Only set theme from Telegram if user hasn't set a preference
      if (!hasUserPreference) {
        const newTheme = (typeof webApp?.colorScheme === 'string') ? webApp.colorScheme : 
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        setTheme(newTheme);
        setDocumentAttribute('data-theme', newTheme);
      }
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
        setDocumentAttribute('data-theme', newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      if (webApp) {
        webApp.offEvent('themeChanged', detectTheme);
      }
    };
  }, [webApp]);

  const setCustomTheme = (newTheme) => {
    setTheme(newTheme);
    setHasUserPreference(true);
    localStorage.setItem(USER_THEME_PREFERENCE, newTheme);
    setDocumentAttribute('data-theme', newTheme);
  };

  return { theme, telegramTheme, setTheme: setCustomTheme };
};
