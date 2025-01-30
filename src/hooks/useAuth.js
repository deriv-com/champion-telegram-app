import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { APP_CONFIG } from '@/config/app.config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  // Custom event for account changes
  const ACCOUNT_CHANGE_EVENT = 'accountChange';
  const emitAccountChange = (account) => {
    const event = new CustomEvent(ACCOUNT_CHANGE_EVENT, { detail: account });
    window.dispatchEvent(event);
  };

  // Check authentication status periodically
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        if (mounted) {
          setIsAuthenticated(isAuth);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    // Initial check
    checkAuth();

    // Periodic check every minute
    const interval = setInterval(checkAuth, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const switchAccount = useCallback(async (account) => {
    try {
      setIsSwitchingAccount(true);
      const success = await authService.setDefaultAccount(account);
      
      if (success) {
        // Update local state immediately
        setDefaultAccount(account);
        
        // Reload trading accounts to ensure consistency
        const accounts = await authService.getTradingAccounts();
        if (accounts) {
          await authService.setTradingAccounts(accounts);
        }
        
        // Notify other components
        emitAccountChange(account);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to switch account:', error);
      return false;
    } finally {
      setTimeout(() => {
        setIsSwitchingAccount(false);
      }, 300); // Small delay to ensure smooth transition
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Starting auth initialization');
      const isInitialized = await authService.initialize();
      console.log('Auth initialization result:', isInitialized);
      
      if (isInitialized) {
        // Get all required data before any state updates
        console.log('Fetching session and account data');
        const [session, account] = await Promise.all([
          authService.getStoredSession(),
          authService.getDefaultAccount()
        ]);
        
        // Check auth synchronously
        const isAuth = authService.isAuthenticated();
        
        console.log('Auth initialized:', {
          session,
          account,
          accountId: account?.account || '',
          isAuth
        });
        
        // Batch state updates
        setUser(session);
        setDefaultAccount(account);
        setIsAuthenticated(isAuth);
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
        const defaultAccount = {
          account: `TG${telegramUser.id}`,
          token: 'telegram-token',
          currency: 'USD',
          balance: '0.00'
        };
        
        success = await authService.setSession(telegramUser) &&
                 await authService.setTradingAccounts([defaultAccount]) &&
                 await authService.setDefaultAccount(defaultAccount);
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
        const [session, account, isAuth] = await Promise.all([
          authService.getStoredSession(),
          authService.getDefaultAccount(),
          authService.isAuthenticated()
        ]);
        
        // Batch state updates
        setUser(session);
        setDefaultAccount(account);
        setIsAuthenticated(isAuth);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOAuthCallback = useCallback(async (searchParams) => {
    try {
      const tradingAccounts = [];
      let index = 1;
      
      while (true) {
        const account = searchParams.get(`acct${index}`);
        const token = searchParams.get(`token${index}`);
        const currency = searchParams.get(`cur${index}`);
        const balance = searchParams.get(`bal${index}`);
        
        if (!account || !token || !currency) break;
        
        tradingAccounts.push({ 
          account, 
          token, 
          currency,
          balance: balance || '0.00'
        });
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
      // Clear session first - this will handle navigation
      const success = await authService.clearSession();
      
      if (success) {
        // Reset all auth state
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

  // Log the state before returning
  console.log('useAuth state:', { 
    user, 
    defaultAccount,
    accountId: defaultAccount?.account || '',
    balance: defaultAccount?.balance || '0.00',
    currency: defaultAccount?.currency || 'USD',
    isAuthenticated,
    isLoading 
  });

  return {
    user,
    defaultAccount,
    accountId: defaultAccount?.account || '',
    balance: defaultAccount?.balance || '0.00',
    currency: defaultAccount?.currency || 'USD',
    isAuthenticated,
    isLoading,
    isSwitchingAccount,
    login,
    logout,
    initialize,
    handleOAuthCallback,
    switchAccount,
    ACCOUNT_CHANGE_EVENT
  };
};
