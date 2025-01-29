import { WebApp } from '@twa-dev/sdk';
import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes.config';

class AuthService {
  constructor() {
    this.storageKey = 'auth_session';
    this.tradingAccountsKey = 'trading_accounts';
    this.defaultAccountKey = 'default_account';
  }

  /**
   * Initialize auth state from storage or Telegram WebApp
   */
  async initialize() {
    // Add encryption/decryption for sensitive data in production
    // Add small delay to simulate network latency in development
    if (APP_CONFIG.environment.isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Check if we have valid Telegram WebApp data first
    const telegramUser = WebApp?.initDataUnsafe?.user;
    if (telegramUser) {
      // We have fresh Telegram data, update session
      await this.setSession(telegramUser);
      return true;
    }
    
    // Fall back to stored session if no Telegram data
    const storedSession = await this.getStoredSession();
    if (storedSession) {
      // We have stored session, validate it
      return this.validateSession(storedSession);
    }
    
    return false;
  }

  // For development testing only
  async createTestSession() {
    if (APP_CONFIG.environment.isDevelopment) {
      // Add small delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 500));

      const testUser = {
        id: 12345,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser'
      };
      await this.setSession(testUser);
      return true;
    }
    return false;
  }

  /**
   * Get stored session from localStorage
   */
  async getStoredSession() {
    try {
      const session = localStorage.getItem(this.storageKey);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Failed to parse stored session:', error);
      return null;
    }
  }

  /**
   * Store session data
   */
  async setSession(userData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Failed to store session:', error);
      return false;
    }
  }

  /**
   * Validate stored session data
   */
  async validateSession(session) {
    // Check if session exists and trading accounts are available
    if (!session) return false;
    
    const tradingAccounts = await this.getTradingAccounts();
    return Boolean(tradingAccounts?.length);
  }

  /**
   * Store trading accounts list
   * @param {Array} accounts - List of trading accounts
   */
  async setTradingAccounts(accounts) {
    try {
      // In production, encrypt sensitive data before storing
      localStorage.setItem(this.tradingAccountsKey, JSON.stringify(accounts));
      return true;
    } catch (error) {
      console.error('Failed to store trading accounts:', error);
      return false;
    }
  }

  /**
   * Get stored trading accounts
   */
  async getTradingAccounts() {
    try {
      const accounts = localStorage.getItem(this.tradingAccountsKey);
      return accounts ? JSON.parse(accounts) : null;
    } catch (error) {
      console.error('Failed to get trading accounts:', error);
      return null;
    }
  }

  /**
   * Set default trading account
   * @param {Object} account - Default trading account
   */
  async setDefaultAccount(account) {
    try {
      localStorage.setItem(this.defaultAccountKey, JSON.stringify(account));
      return true;
    } catch (error) {
      console.error('Failed to set default account:', error);
      return false;
    }
  }

  /**
   * Get default trading account
   */
  async getDefaultAccount() {
    try {
      const account = localStorage.getItem(this.defaultAccountKey);
      return account ? JSON.parse(account) : null;
    } catch (error) {
      console.error('Failed to get default account:', error);
      return null;
    }
  }

  /**
   * Clear session data
   */
  async clearSession() {
    try {
      // Clear all localStorage data
      localStorage.clear();
      
      // Add small delay in development
      if (APP_CONFIG.environment.isDevelopment) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Always navigate to home route after clearing session
      window.location.href = ROUTES.HOME;
      return true;
    } catch (error) {
      console.error('Failed to clear session:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   * Note: This is a synchronous check for route protection.
   * For full validation, use initialize() instead.
   */
  isAuthenticated() {
    try {
      // Check for session
      const sessionStr = localStorage.getItem(this.storageKey);
      const hasStoredSession = Boolean(sessionStr);
      const hasTelegramUser = Boolean(WebApp?.initDataUnsafe?.user);
      
      // Check for trading accounts
      const tradingAccountsStr = localStorage.getItem(this.tradingAccountsKey);
      const hasTradingAccounts = Boolean(tradingAccountsStr);
      
      // User is authenticated if they have either:
      // 1. Both a session and trading accounts
      // 2. Telegram user data (for Telegram-only auth)
      return (hasStoredSession && hasTradingAccounts) || hasTelegramUser;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
