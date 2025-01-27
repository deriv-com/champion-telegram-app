import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useTelegram } from '@/hooks/useTelegram';
import React from 'react';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { webApp } = useTelegram();

  React.useEffect(() => {
    // If we have Telegram user data, they're already authenticated
    if (webApp?.initDataUnsafe?.user) {
      navigate(ROUTES.DASHBOARD);
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
