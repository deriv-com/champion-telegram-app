import { useEffect, useCallback, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { haptic } from '@/utils/telegram';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

// Update viewport metrics
const updateViewportMetrics = () => {
  const root = document.documentElement;
  try {
    // Set viewport heights
    root.style.setProperty('--tg-viewport-height', `${WebApp.viewportHeight}px`);
    root.style.setProperty('--tg-viewport-stable-height', `${WebApp.viewportStableHeight}px`);
    
    // Set safe areas using Telegram WebApp's built-in values
    root.style.setProperty('--tg-safe-area-top', `${WebApp.safeAreaInset?.top || 0}px`);
    root.style.setProperty('--tg-safe-area-right', `${WebApp.safeAreaInset?.right || 0}px`);
    root.style.setProperty('--tg-safe-area-bottom', `${WebApp.safeAreaInset?.bottom || 0}px`);
    root.style.setProperty('--tg-safe-area-left', `${WebApp.safeAreaInset?.left || 0}px`);

    // Set background color to match theme
    document.body.style.backgroundColor = WebApp.backgroundColor;
  } catch (error) {
    console.error('Failed to update viewport metrics:', error);
    // Reset to safe defaults
    root.style.setProperty('--tg-viewport-height', '100vh');
    root.style.setProperty('--tg-viewport-stable-height', '100vh');
    root.style.setProperty('--tg-safe-area-top', '0px');
    root.style.setProperty('--tg-safe-area-right', '0px');
    root.style.setProperty('--tg-safe-area-bottom', '0px');
    root.style.setProperty('--tg-safe-area-left', '0px');
  }
};

// Initialize Telegram WebApp
export const initializeTelegramWebApp = () => {
  const cleanup = {
    viewportChanged: null,
    themeChanged: null,
    orientationChanged: null
  };

  try {
    // Initialize WebApp
    WebApp.ready();

    // Lock orientation to portrait mode
    WebApp.lockOrientation();
    
    // Expand the WebApp to maximum available height
    WebApp.expand();

    // Initial setup
    updateViewportMetrics();
    
    // Set header color and theme parameters
    WebApp.setHeaderColor(WebApp.backgroundColor);
    
    // Set initial theme parameters
    const root = document.documentElement;
    const params = WebApp.themeParams;
    Object.entries(params).forEach(([key, value]) => {
      if (key.includes('color')) {
        root.style.setProperty(`--tg-theme-${key}`, value);
      }
    });
    root.setAttribute('data-telegram-theme', WebApp.colorScheme || 'light');
    
    // Update on viewport changes
    cleanup.viewportChanged = () => {
      updateViewportMetrics();
    };
    WebApp.onEvent('viewportChanged', cleanup.viewportChanged);
    
    // Update on theme changes
    cleanup.themeChanged = () => {
      document.body.style.backgroundColor = WebApp.backgroundColor;
      WebApp.setHeaderColor(WebApp.backgroundColor);
      updateViewportMetrics();
    };
    WebApp.onEvent('themeChanged', cleanup.themeChanged);

    // Handle orientation changes
    cleanup.orientationChanged = () => {
      updateViewportMetrics();
    };
    WebApp.onEvent('orientationChanged', cleanup.orientationChanged);
  } catch (error) {
    console.error('Telegram WebApp initialization failed:', error);
    throw new Error('Failed to initialize Telegram WebApp');
  }

  // Return cleanup function
  return () => {
    try {
      if (cleanup.viewportChanged) WebApp.offEvent('viewportChanged', cleanup.viewportChanged);
      if (cleanup.themeChanged) WebApp.offEvent('themeChanged', cleanup.themeChanged);
      if (cleanup.orientationChanged) WebApp.offEvent('orientationChanged', cleanup.orientationChanged);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  };
};

export const useTelegram = () => {
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
    // Set initial viewport height
    updateViewportMetrics();

    // Update on viewport changes
    WebApp.onEvent('viewportChanged', updateViewportMetrics);
    return () => WebApp.offEvent('viewportChanged', updateViewportMetrics);
  }, []);

  // Handle theme setup and changes
  useEffect(() => {
    const handleThemeParams = () => {
      const root = document.documentElement;
      const params = WebApp.themeParams;
      
      // Set theme parameters
      Object.entries(params).forEach(([key, value]) => {
        if (key.includes('color')) {
          root.style.setProperty(`--tg-theme-${key}`, value);
        }
      });

      // Set color scheme
      const scheme = WebApp.colorScheme || 'light';
      root.setAttribute('data-telegram-theme', scheme);
    };

    // Set initial theme parameters
    handleThemeParams();

    // Update on theme changes
    WebApp.onEvent('themeChanged', handleThemeParams);
    return () => WebApp.offEvent('themeChanged', handleThemeParams);
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
  const showPopup = useCallback((params) => {
    try {
      // Check if we're in a valid Telegram WebApp environment
      if (!WebApp.initData) {
        // Fallback for development/testing outside Telegram
        console.warn('Not in Telegram environment, falling back to alert');
        WebApp.showAlert(typeof params === 'string' ? params : params.message);
        return;
      }

      // Handle both string messages and object params
      const popupParams = typeof params === 'string' 
        ? { message: params } 
        : params;

      WebApp.showPopup({
        message: popupParams.message,
        title: popupParams.title,
        buttons: popupParams.buttons || [{ type: 'default' }]
      });
      haptic.notification();
    } catch (error) {
      // Handle case where method is unsupported
      console.warn('showPopup not supported, falling back to alert:', error);
      WebApp.showAlert(typeof params === 'string' ? params : params.message);
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
    isExpanded: WebApp.isExpanded,
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
