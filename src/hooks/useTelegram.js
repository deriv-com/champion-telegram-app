import { useEffect, useCallback, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { haptic } from '@/utils/telegram';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

// Initialize Telegram WebApp
export const initializeTelegramWebApp = () => {
  try {
    // Initialize WebApp
    WebApp.ready();

    // Lock orientation to portrait mode
    WebApp.lockOrientation();
    
    // Set initial viewport height
    const root = document.documentElement;
    root.style.setProperty('--tg-viewport-height', `${WebApp.viewportHeight}px`);
    root.style.setProperty('--tg-viewport-stable-height', `${WebApp.viewportStableHeight}px`);

    // Request fullscreen mode
    WebApp.requestFullscreen();
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
    const updateViewportHeight = () => {
      const root = document.documentElement;
      // Set viewport heights from Telegram WebApp
      const viewportHeight = WebApp.viewportHeight;
      const viewportStableHeight = WebApp.viewportStableHeight;
      
      // Update CSS variables
      root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
      root.style.setProperty('--tg-viewport-stable-height', `${viewportStableHeight}px`);
      
      // Update expanded state
      setIsExpanded(WebApp.isExpanded);
    };

    // Set initial viewport height
    updateViewportHeight();

    // Update on viewport changes
    WebApp.onEvent('viewportChanged', updateViewportHeight);
    return () => WebApp.offEvent('viewportChanged', updateViewportHeight);
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
    try {
      // Check if we're in a valid Telegram WebApp environment
      if (!WebApp.initData) {
        // Fallback for development/testing outside Telegram
        console.warn('Not in Telegram environment, falling back to alert');
        WebApp.showAlert(message);
        return;
      }
      
      WebApp.showPopup({ message, buttons });
      haptic.notification();
    } catch (error) {
      // Handle case where method is unsupported
      console.warn('showPopup not supported, falling back to alert:', error);
      WebApp.showAlert(message);
    }
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
