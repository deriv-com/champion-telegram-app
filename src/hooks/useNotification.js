import { useCallback } from 'react';
import { useTelegram } from './useTelegram';

export const useNotification = () => {
  const { showPopup, showAlert, haptic } = useTelegram();

  const success = useCallback((message, options = {}) => {
    const { usePopup = false } = options;
    haptic.notification('success');
    
    if (usePopup) {
      showPopup({
        message: `✅ ${message}`,
        buttons: [{ type: 'close' }]
      });
    } else {
      showAlert(`✅ ${message}`);
    }
  }, [showPopup, showAlert, haptic]);

  const error = useCallback((message, options = {}) => {
    const { usePopup = false } = options;
    haptic.notification('error');
    
    if (usePopup) {
      showPopup({
        message: `❌ ${message}`,
        buttons: [{ type: 'close' }]
      });
    } else {
      showAlert(`❌ ${message}`);
    }
  }, [showPopup, showAlert, haptic]);

  const info = useCallback((message, options = {}) => {
    const { usePopup = false } = options;
    haptic.notification('warning');
    
    if (usePopup) {
      showPopup({
        message: `ℹ️ ${message}`,
        buttons: [{ type: 'close' }]
      });
    } else {
      showAlert(`ℹ️ ${message}`);
    }
  }, [showPopup, showAlert, haptic]);

  const confirm = useCallback(async (message) => {
    haptic.impact();
    return new Promise((resolve) => {
      showPopup({
        message,
        buttons: [
          {
            type: 'ok',
            text: 'Confirm',
            onClick: () => resolve(true),
          },
          {
            type: 'cancel',
            text: 'Cancel',
            onClick: () => resolve(false),
          },
        ],
      });
    });
  }, [showPopup, haptic]);

  return {
    success,
    error,
    info,
    confirm,
  };
};
