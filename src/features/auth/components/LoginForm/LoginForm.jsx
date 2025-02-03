import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useTelegram, useAuth } from '@/hooks';
import { Loading } from '@/shared/components/Loading';
import React from 'react';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const { login, isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    const initializeSession = async () => {
      if (!isAuthenticated) {
        if (webApp?.initDataUnsafe?.user) {
          await login(webApp.initDataUnsafe.user);
        } else {
          // Try login without Telegram data (for development)
          await login();
        }
      }
    };

    initializeSession();
  }, [webApp, login, isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

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
