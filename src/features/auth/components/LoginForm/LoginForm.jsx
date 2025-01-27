import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useTelegram } from '@/hooks/useTelegram';
import { authService } from '@/services/auth.service';
import { APP_CONFIG } from '@/config/app.config';
import React from 'react';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { webApp } = useTelegram();

  React.useEffect(() => {
    // If we have Telegram user data, store it and redirect
    if (webApp?.initDataUnsafe?.user) {
      authService.setSession(webApp.initDataUnsafe.user);
      navigate(ROUTES.DASHBOARD);
    } else if (APP_CONFIG.environment.isDevelopment) {
      // In development, create a test session when accessing login page
      authService.createTestSession();
      navigate(ROUTES.DASHBOARD);
    } else {
      // If no Telegram data and no stored session, ensure we're logged out
      if (!authService.getStoredSession()) {
        authService.clearSession();
      }
    }
  }, [webApp, navigate]);

  return (
    <div className={styles.loginForm}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Champion Trade</h1>
        <p className={styles.subtitle}>
          Please open this app through Telegram to access your account
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
