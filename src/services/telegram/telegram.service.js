export const initializeTelegramWebApp = () => {
  if (!window.Telegram?.WebApp) {
    console.warn('Telegram WebApp is not available - running in standalone mode');
    return;
  }

  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
};

export const getThemeParams = () => {
  if (!window.Telegram?.WebApp) {
    // Default theme params when not in Telegram
    return {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#00C7F4',
      button_color: '#00C7F4',
      button_text_color: '#ffffff',
    };
  }

  return window.Telegram.WebApp.themeParams || {};
};
