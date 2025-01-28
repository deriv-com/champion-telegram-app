import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useTelegram } from '@/hooks/useTelegram';
import { useLoading } from '@/hooks/useLoading';
import { authService } from '@/services/auth.service';
import { APP_CONFIG } from '@/config/app.config';
import { Loading } from '@/shared/components/Loading';
import React from 'react';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const { isLoading, withLoading } = useLoading();

  React.useEffect(() => {
    const initializeSession = async () => {
      await withLoading(async () => {
        // If we have Telegram user data, store it and redirect
        if (webApp?.initDataUnsafe?.user) {
          await authService.setSession(webApp.initDataUnsafe.user);
          navigate(ROUTES.DASHBOARD);
        } else if (APP_CONFIG.environment.isDevelopment) {
          // In development, create a test session when accessing login page
          await authService.createTestSession();
          navigate(ROUTES.DASHBOARD);
        } else {
          // If no Telegram data, check for stored session
          const storedSession = await authService.getStoredSession();
          if (storedSession) {
            // If we have a valid stored session, redirect to dashboard
            const isValid = await authService.validateSession(storedSession);
            if (isValid) {
              navigate(ROUTES.DASHBOARD);
              return;
            }
          }
          // If no valid session, ensure we're logged out
          await authService.clearSession();
        }
      });
    };

    initializeSession();
  }, [webApp, navigate, withLoading]);

  return (
    <div className={styles.loginForm}>
      <div className={styles.container}>
        {isLoading ? (
          <Loading size="lg" text="Preparing your trading dashboard..." />
        ) : (
          <>
            <h1 className={styles.title}>Welcome to Champion Trade</h1>
            <p className={styles.subtitle}>
              Please open this app through Telegram to access your account
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
