import { useCallback } from 'react';
import { useTelegram } from './useTelegram';
import { useToast } from '../contexts/ToastContext';

/**
 * @typedef {Object} NotificationOptions
 * @property {('top'|'bottom')} [position='top'] - Toast position
 * @property {number} [duration=3000] - Auto-close duration in ms
 * @property {React.ReactNode} [icon] - Custom icon
 * @property {{ label: string, onClick: Function }} [action] - Action button config
 * @property {boolean} [useHaptic=true] - Whether to use haptic feedback
 */

/**
 * Hook for showing notifications with haptic feedback
 * @returns {Object} Notification methods
 * @property {(message: string, options?: NotificationOptions) => number} success - Show success notification
 * @property {(message: string, options?: NotificationOptions) => number} error - Show error notification
 * @property {(message: string, options?: NotificationOptions) => number} info - Show info notification
 * @property {(message: string) => Promise<boolean>} confirm - Show confirmation dialog
 */
export const useNotification = () => {
  const { haptic } = useTelegram();
  const { showToast } = useToast();

  /**
   * Base notification function
   * @param {Object} params - Notification parameters
   * @param {string} params.message - Message to display
   * @param {('info'|'success'|'error')} params.type - Notification type
   * @param {NotificationOptions} [params.options] - Additional options
   * @returns {number} Toast ID
   */
  const notify = useCallback(({ message, type = 'info', options = {} }) => {
    const {
      position = 'top',
      duration = 3000,
      icon,
      action,
      useHaptic = true
    } = options;

    if (useHaptic) {
      haptic.notification(type === 'error' ? 'error' : 'success');
    }

    return showToast({
      message,
      type,
      position,
      duration,
      icon,
      action
    });
  }, [haptic, showToast]);

  /**
   * Show success notification
   * @param {string} message - Message to display
   * @param {NotificationOptions} [options] - Additional options
   * @returns {number} Toast ID
   */
  const success = useCallback((message, options = {}) => {
    return notify({
      message,
      type: 'success',
      options
    });
  }, [notify]);

  /**
   * Show error notification
   * @param {string} message - Message to display
   * @param {NotificationOptions} [options] - Additional options
   * @returns {number} Toast ID
   */
  const error = useCallback((message, options = {}) => {
    return notify({
      message,
      type: 'error',
      options
    });
  }, [notify]);

  /**
   * Show info notification
   * @param {string} message - Message to display
   * @param {NotificationOptions} [options] - Additional options
   * @returns {number} Toast ID
   */
  const info = useCallback((message, options = {}) => {
    return notify({
      message,
      type: 'info',
      options
    });
  }, [notify]);

  /**
   * Show confirmation dialog using Telegram's native UI
   * @param {string} message - Message to display
   * @returns {Promise<boolean>} User's response
   */
  const confirm = useCallback(async (message) => {
    haptic.impact();
    return new Promise((resolve) => {
      window.Telegram.WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    });
  }, [haptic]);

  return {
    success,
    error,
    info,
    confirm,
  };
};
