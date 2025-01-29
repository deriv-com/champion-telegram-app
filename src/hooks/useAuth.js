import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { APP_CONFIG } from '@/config/app.config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      const isInitialized = await authService.initialize();
      if (isInitialized) {
        // Get all required data before any state updates
        const [session, account] = await Promise.all([
          authService.getStoredSession(),
          authService.getDefaultAccount()
        ]);
        
        // Batch state updates
        setUser(session);
        setDefaultAccount(account);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (telegramUser, oauthData) => {
    try {
      setIsLoading(true);
      let success = false;
      
      if (telegramUser) {
        success = await authService.setSession(telegramUser);
      } else if (oauthData?.tradingAccounts?.length > 0) {
        const defaultAccount = oauthData.tradingAccounts[0];
        const sessionData = {
          accountId: defaultAccount.account,
          token: defaultAccount.token,
          currency: defaultAccount.currency
        };
        
        success = await authService.setSession(sessionData) &&
                 await authService.setTradingAccounts(oauthData.tradingAccounts) &&
                 await authService.setDefaultAccount(defaultAccount);
      } else if (APP_CONFIG.environment.isDevelopment) {
        success = await authService.createTestSession();
      }
      
      if (success) {
        // Get all required data before any state updates
        const [session, account] = await Promise.all([
          authService.getStoredSession(),
          authService.getDefaultAccount()
        ]);
        
        // Batch state updates
        setUser(session);
        setDefaultAccount(account);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [initialize]);

  const handleOAuthCallback = useCallback(async (searchParams) => {
    try {
      const tradingAccounts = [];
      let index = 1;
      
      while (true) {
        const account = searchParams.get(`acct${index}`);
        const token = searchParams.get(`token${index}`);
        const currency = searchParams.get(`cur${index}`);
        
        if (!account || !token || !currency) break;
        
        tradingAccounts.push({ account, token, currency });
        index++;
      }

      if (tradingAccounts.length > 0) {
        return login(null, { tradingAccounts });
      }
      
      return false;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      return false;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const success = await authService.clearSession();
      
      if (success) {
        // Batch state updates to prevent race conditions
        setUser(null);
        setDefaultAccount(null);
        setIsAuthenticated(false);
      }
      
      return success;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    defaultAccount,
    accountId: defaultAccount?.account || '',
    balance: defaultAccount?.balance || '0.00',
    isAuthenticated,
    isLoading,
    login,
    logout,
    initialize,
    handleOAuthCallback
  };
};
