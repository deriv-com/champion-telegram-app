import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [webApp, setWebApp] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      setWebApp(window.Telegram.WebApp);
    }
  }, []);

  return webApp;
};
