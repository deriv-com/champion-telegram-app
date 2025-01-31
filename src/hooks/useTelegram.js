import { useEffect, useCallback, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { haptic } from '@/utils/telegram';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

// Initialize Telegram WebApp
export const initializeTelegramWebApp = () => {
  try {
    WebApp.ready();
    WebApp.expand();
  } catch (error) {
    console.warn('Telegram WebApp initialization failed:', error);
  }
};

export const useTelegram = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBackButtonVisible, setIsBackButtonVisible] = useState(false);
  const [isMainButtonVisible, setIsMainButtonVisible] = useState(false);
  const [isClosingConfirmationEnabled, setIsClosingConfirmationEnabled] = useState(false);

  // Handle back button
  const handleBackButton = useCallback((callback) => {
    if (!WebApp.BackButton.isVisible) {
      WebApp.BackButton.show();
      setIsBackButtonVisible(true);
    }
    
    WebApp.BackButton.onClick(() => {
      haptic.impact();
      callback();
    });

    return () => {
      WebApp.BackButton.offClick();
      WebApp.BackButton.hide();
      setIsBackButtonVisible(false);
    };
  }, []);

  // Handle main button
  const handleMainButton = useCallback((params) => {
    const {
      text,
      color = '#2481cc',
      textColor = '#ffffff',
      callback,
      isActive = true,
    } = params;

    WebApp.MainButton.setParams({
      text,
      color,
      text_color: textColor,
      is_active: isActive,
      is_visible: true,
    });

    setIsMainButtonVisible(true);
    
    if (callback) {
      WebApp.MainButton.onClick(() => {
        haptic.impact();
        callback();
      });
    }

    return () => {
      WebApp.MainButton.offClick();
      WebApp.MainButton.hide();
      setIsMainButtonVisible(false);
    };
  }, []);

  // Handle viewport changes
  useEffect(() => {
    const handleViewportChanged = () => {
      setIsExpanded(WebApp.isExpanded);
    };

    WebApp.onEvent('viewportChanged', handleViewportChanged);
    return () => WebApp.offEvent('viewportChanged', handleViewportChanged);
  }, []);

  // Handle theme changes
  useEffect(() => {
    const handleThemeChanged = () => {
      const root = document.documentElement;
      const params = WebApp.themeParams;
      
      Object.entries(params).forEach(([key, value]) => {
        if (key.includes('color')) {
          root.style.setProperty(`--tg-theme-${key}`, value);
        }
      });
    };

    WebApp.onEvent('themeChanged', handleThemeChanged);
    return () => WebApp.offEvent('themeChanged', handleThemeChanged);
  }, []);

  // Handle closing confirmation
  const enableClosingConfirmation = useCallback(() => {
    WebApp.enableClosingConfirmation();
    setIsClosingConfirmationEnabled(true);
  }, []);

  const disableClosingConfirmation = useCallback(() => {
    WebApp.disableClosingConfirmation();
    setIsClosingConfirmationEnabled(false);
  }, []);

  // Utility functions
  const showPopup = useCallback((message, buttons = [{ type: 'close' }]) => {
    WebApp.showPopup({ message, buttons });
    haptic.notification();
  }, []);

  const showAlert = useCallback((message) => {
    WebApp.showAlert(message);
    haptic.notification();
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      WebApp.showConfirm(message, (confirmed) => {
        haptic.impact();
        resolve(confirmed);
      });
    });
  }, []);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTelegramLogin = useCallback(async () => {
    try {
      // Get Telegram user data
      const telegramUser = WebApp?.initDataUnsafe?.user;
      if (!telegramUser) {
        showAlert('Please open this app through Telegram');
        return;
      }

      // Attempt login
      const success = await login(telegramUser);
      if (success) {
        haptic.impact();
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        haptic.notification();
        showAlert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Telegram login failed:', error);
      haptic.notification();
      showAlert('Login failed. Please try again.');
    }
  }, [login, navigate, showAlert]);

  return {
    // State
    isExpanded,
    isBackButtonVisible,
    isMainButtonVisible,
    isClosingConfirmationEnabled,
    
    // Button handlers
    handleBackButton,
    handleMainButton,
    handleTelegramLogin,
    
    // Closing confirmation
    enableClosingConfirmation,
    disableClosingConfirmation,
    
    // UI helpers
    showPopup,
    showAlert,
    showConfirm,
    
    // Raw WebApp instance for advanced usage
    webApp: WebApp,
    
    // Theme
    themeParams: WebApp.themeParams,
    colorScheme: WebApp.colorScheme,
    
    // Platform info
    platform: WebApp.platform,
    isVersionAtLeast: WebApp.isVersionAtLeast.bind(WebApp),
    
    // Haptic feedback
    haptic,
  };
};
