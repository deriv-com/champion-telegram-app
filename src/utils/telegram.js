import WebApp from '@twa-dev/sdk';

/**
 * Haptic feedback utilities for Telegram WebApp
 */
export const haptic = {
  /**
   * Impact feedback - use for button clicks, selections
   */
  impact: () => {
    try {
      WebApp.HapticFeedback.impactOccurred('medium');
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  },

  /**
   * Notification feedback - use for alerts, popups
   */
  notification: (type = 'success') => {
    try {
      WebApp.HapticFeedback.notificationOccurred(type);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  },

  /**
   * Selection feedback - use for selection changes
   */
  selection: () => {
    try {
      WebApp.HapticFeedback.selectionChanged();
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
};
