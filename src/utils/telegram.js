import WebApp from '@twa-dev/sdk';
import { APP_CONFIG } from '@/config/app.config';

const isDevelopment = APP_CONFIG.environment.isDevelopment;

// Mock WebApp for development
const MockWebApp = {
  ready: () => console.log('Mock: WebApp ready'),
  expand: () => console.log('Mock: WebApp expand'),
  HapticFeedback: {
    notificationOccurred: () => console.log('Mock: Haptic notification'),
    impactOccurred: () => console.log('Mock: Haptic impact'),
    selectionChanged: () => console.log('Mock: Haptic selection'),
  },
  BackButton: { isVisible: false },
  MainButton: {
    setParams: () => console.log('Mock: MainButton setParams'),
    hide: () => console.log('Mock: MainButton hide'),
  },
  showPopup: ({ message }) => console.log('Mock: Show popup', message),
  showConfirm: (message, callback) => {
    console.log('Mock: Show confirm', message);
    callback?.(true);
  },
  CloudStorage: null,
  colorScheme: 'light',
  themeParams: {},
  initData: '',
};

// Use mock in development, real WebApp in production
const TelegramWebApp = isDevelopment ? MockWebApp : WebApp;

/**
 * Handles haptic feedback for different actions
 */
export const haptic = {
  notification: () => TelegramWebApp.HapticFeedback.notificationOccurred('success'),
  impact: () => TelegramWebApp.HapticFeedback.impactOccurred('light'),
  selection: () => TelegramWebApp.HapticFeedback.selectionChanged(),
};

/**
 * Initializes the Telegram WebApp
 */
export const initializeTelegramWebApp = () => {
  try {
    if (isDevelopment) {
      console.log('Initializing Telegram WebApp in development mode');
      TelegramWebApp.ready();
      TelegramWebApp.expand();
      return;
    }

    // Signal webapp is ready
    TelegramWebApp.ready();

    // Set theme-based colors
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    TelegramWebApp.setHeaderColor?.(darkMode ? '#000000' : '#ffffff');
    TelegramWebApp.setBackgroundColor?.(darkMode ? '#1c1c1e' : '#ffffff');

    // Handle safe area insets
    if (TelegramWebApp.viewportStableHeight) {
      const root = document.documentElement;
      const { viewport_height, viewport_stable_height } = TelegramWebApp.viewportStableHeight;
      
      root.style.setProperty('--tg-viewport-height', `${viewport_height}px`);
      root.style.setProperty('--tg-viewport-stable-height', `${viewport_stable_height}px`);
    }

    if (TelegramWebApp.safeArea) {
      const root = document.documentElement;
      root.style.setProperty('--tg-safe-area-top', `${TelegramWebApp.safeArea.top}px`);
      root.style.setProperty('--tg-safe-area-bottom', `${TelegramWebApp.safeArea.bottom}px`);
    }

    // Configure back button if needed
    if (TelegramWebApp.BackButton?.isVisible) {
      TelegramWebApp.BackButton.onClick(() => {
        haptic.impact();
        window.history.back();
      });
    }

    // Production-specific settings
    if (APP_CONFIG.environment.isProduction) {
      TelegramWebApp.enableClosingConfirmation?.();
    }

    // Expand to full height
    TelegramWebApp.expand();

    // Setup cloud storage if available
    if (TelegramWebApp.CloudStorage) {
      TelegramWebApp.CloudStorage.setItem('app_initialized', 'true').catch(console.error);
    }

  } catch (error) {
    console.error('Failed to initialize Telegram WebApp:', error);
    if (!isDevelopment) {
      throw error;
    }
  }
};

/**
 * Shows the main button with specified text and color
 */
export const showMainButton = (text, color = '#2481cc') => {
  try {
    TelegramWebApp.MainButton.setParams({
      text,
      color,
      text_color: '#ffffff',
      is_active: true,
      is_visible: true,
    });
  } catch (error) {
    console.error('Failed to show main button:', error);
  }
};

/**
 * Hides the main button
 */
export const hideMainButton = () => {
  try {
    TelegramWebApp.MainButton.hide();
  } catch (error) {
    console.error('Failed to hide main button:', error);
  }
};

/**
 * Shows a popup with specified message
 */
export const showPopup = (message, buttons = [{ type: 'close' }]) => {
  try {
    TelegramWebApp.showPopup({
      message,
      buttons,
    });
    haptic.notification();
  } catch (error) {
    console.error('Failed to show popup:', error);
  }
};

/**
 * Shows a confirmation popup
 */
export const showConfirm = (message) => {
  return new Promise((resolve) => {
    try {
      TelegramWebApp.showConfirm(message, (confirmed) => {
        haptic.impact();
        resolve(confirmed);
      });
    } catch (error) {
      console.error('Failed to show confirm:', error);
      resolve(false);
    }
  });
};

/**
 * Checks if the app is running in Telegram
 */
export const isRunningInTelegram = () => {
  return window.Telegram?.WebApp != null;
};

/**
 * Gets the Telegram WebApp theme params
 */
export const getThemeParams = () => {
  return TelegramWebApp.themeParams || {};
};

/**
 * Gets the Telegram WebApp color scheme
 */
export const getColorScheme = () => {
  return TelegramWebApp.colorScheme || 'light';
};

/**
 * Gets the Telegram WebApp init data
 */
export const getInitData = () => {
  return TelegramWebApp.initData || '';
};
