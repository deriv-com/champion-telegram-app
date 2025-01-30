import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Loading } from '@/shared';
import { ROUTES } from '@/config/routes.config';
import { APP_CONFIG } from '@/config/app.config';
import { useTelegram, useAuth } from '@/hooks';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleTelegramLogin } = useTelegram();
  const { handleOAuthCallback, isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    // Check if we're in the middle of a logout
    const isLoggingOut = sessionStorage.getItem('logout_in_progress');
    if (isLoggingOut) {
      // Clear the flag
      sessionStorage.removeItem('logout_in_progress');
      return;
    }

    // Handle normal login flow
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    // Process OAuth callback if present
    if (location.search) {
      const searchParams = new URLSearchParams(location.search);
      handleOAuthCallback(searchParams).then(success => {
        if (success) {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
      });
    }
  }, [location.search, navigate, handleOAuthCallback, isAuthenticated]);

  const handleExistingAccountLogin = () => {
    window.location.href = APP_CONFIG.auth.oauthUrl;
  };

  const handleSignupRedirect = () => {
    window.open(APP_CONFIG.auth.signupUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.container}>
          <Loading size="lg" text="Processing login..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Login to Champion Trade</h1>
        
        <div className={styles.loginOptions}>
          {/* Option 1: Login with existing account */}
          <div className={styles.loginOption}>
            <h2>Have an account?</h2>
            <Button
              variant="primary"
              onClick={handleExistingAccountLogin}
              fullWidth
            >
              Login with existing account
            </Button>
          </div>

          {/* Option 2: Account creation restriction */}
          <div className={styles.loginOption}>
            <h2>Need an account?</h2>
            <p className={styles.restrictionMessage}>
              Account creation is currently unavailable in this app.
            </p>
            <Button
              variant="secondary"
              onClick={handleSignupRedirect}
              fullWidth
            >
              Create account on website
            </Button>
          </div>

          {/* Option 3: Telegram login */}
          <div className={styles.loginOption}>
            <h2>Use Telegram</h2>
            <Button
              variant="primary"
              onClick={handleTelegramLogin}
              fullWidth
              disabled
            >
              Continue with Telegram
            </Button>
            <p className={styles.restrictionMessage}>
              Please open this app directly through Telegram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
