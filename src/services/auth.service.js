import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes.config';
import { AES, enc } from 'crypto-js';
import { WebApp } from '@twa-dev/sdk';

class AuthService {
  constructor() {
    this.storageKey = 'auth_session';
    this.tradingAccountsKey = 'trading_accounts';
    this.defaultAccountKey = 'default_account';
    
    // Ensure encryption key is available from APP_CONFIG
    const encryptionKey = APP_CONFIG.security.encryptionKey;
    if (!encryptionKey) {
      throw new Error('Encryption key is required for secure storage');
    }
    this.encryptionKey = encryptionKey;
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data) {
    if (!data) return null;
    try {
      const stringified = JSON.stringify(data);
      return AES.encrypt(stringified, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    if (!encryptedData) return null;
    try {
      const bytes = AES.decrypt(encryptedData, this.encryptionKey);
      return JSON.parse(bytes.toString(enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Initialize auth state from storage or Telegram WebApp
   */
  async initialize() {
    try {
      // Add small delay to simulate network latency in development
      if (APP_CONFIG.environment.isDevelopment) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Check if we have valid Telegram WebApp data first
      const telegramUser = WebApp?.initDataUnsafe?.user;
      if (telegramUser) {
        // We have fresh Telegram data, update session
        const success = await this.setSession(telegramUser);
        
        // Set up accounts for Telegram users if not exists
        const existingAccount = await this.getDefaultAccount();
        if (!existingAccount && success) {
          const defaultAccount = {
            account: `TG${telegramUser.id}`,
            token: 'telegram-token',
            currency: 'USD',
            balance: '0.00'
          };
          await this.setTradingAccounts([defaultAccount]);
          await this.setDefaultAccount(defaultAccount);
        }
        
        return true;
      }
      
      // Fall back to stored session if no Telegram data
      const storedSession = await this.getStoredSession();
      if (storedSession) {
        // We have stored session, validate it
        return this.validateSession(storedSession);
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
  }

  /**
   * Store session data with encryption
   */
  async setSession(userData) {
    try {
      console.log('Setting session for user:', userData);
      const encryptedData = this.encrypt(userData);
      if (!encryptedData) {
        console.error('Failed to encrypt user data');
        return false;
      }
      localStorage.setItem(this.storageKey, encryptedData);
      console.log('Session stored successfully');
      return true;
    } catch (error) {
      console.error('Failed to store session:', error);
      return false;
    }
  }

  /**
   * Get stored session from localStorage with decryption
   */
  async getStoredSession() {
    try {
      const encryptedSession = localStorage.getItem(this.storageKey);
      if (!encryptedSession) {
        console.log('No session found in storage');
        return null;
      }
      
      const decryptedSession = this.decrypt(encryptedSession);
      if (!decryptedSession) {
        console.error('Failed to decrypt session, clearing corrupted data');
        await this.clearSession();
        return null;
      }
      
      return decryptedSession;
    } catch (error) {
      console.error('Failed to parse stored session:', error);
      await this.clearSession();
      return null;
    }
  }

  /**
   * Validate stored session data
   */
  async validateSession(session) {
    try {
      // Clear any corrupted data
      if (!session) {
        await this.clearSession();
        return false;
      }

      // Comprehensive session validation
      const isValidSession = session && 
        typeof session === 'object' &&
        (
          // Telegram user validation
          (
            typeof session.id === 'number' &&
            typeof session.username === 'string' &&
            session.username.length > 0
          ) ||
          // OAuth user validation
          (
            typeof session.accountId === 'string' &&
            typeof session.token === 'string' &&
            typeof session.currency === 'string'
          )
        );

      if (!isValidSession) {
        console.error('Invalid session structure:', session);
        await this.clearSession();
        return false;
      }

      // Verify and validate trading accounts
      const tradingAccounts = await this.getTradingAccounts();
      const defaultAccount = await this.getDefaultAccount();

      const hasValidAccounts = Array.isArray(tradingAccounts) && 
        tradingAccounts.length > 0 &&
        tradingAccounts.every(acc => 
          acc && 
          typeof acc.account === 'string' &&
          typeof acc.token === 'string' &&
          typeof acc.currency === 'string'
        );

      if (!hasValidAccounts || !defaultAccount) {
        console.error('Invalid trading accounts or missing default account');
        // Only set up default account for Telegram users
        if (session.id && session.username) {
          const defaultAccount = {
            account: `TG${session.id}`,
            token: 'telegram-token',
            currency: 'USD',
            balance: '0.00'
          };
          await this.setTradingAccounts([defaultAccount]);
          await this.setDefaultAccount(defaultAccount);
        } else {
          await this.clearSession();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      await this.clearSession();
      return false;
    }
  }

  /**
   * Store trading accounts list with encryption
   */
  async setTradingAccounts(accounts) {
    try {
      const encryptedAccounts = this.encrypt(accounts);
      if (!encryptedAccounts) return false;
      localStorage.setItem(this.tradingAccountsKey, encryptedAccounts);
      return true;
    } catch (error) {
      console.error('Failed to store trading accounts:', error);
      return false;
    }
  }

  /**
   * Get stored trading accounts with decryption
   */
  async getTradingAccounts() {
    try {
      const encryptedAccounts = localStorage.getItem(this.tradingAccountsKey);
      if (!encryptedAccounts) {
        console.log('No trading accounts found in storage');
        return null;
      }
      
      const decryptedAccounts = this.decrypt(encryptedAccounts);
      if (!decryptedAccounts) {
        console.error('Failed to decrypt trading accounts, clearing corrupted data');
        await this.clearSession();
        return null;
      }
      
      return decryptedAccounts;
    } catch (error) {
      console.error('Failed to get trading accounts:', error);
      await this.clearSession();
      return null;
    }
  }

  /**
   * Set default trading account with encryption
   */
  async setDefaultAccount(account) {
    try {
      console.log('Setting default account:', account);
      const encryptedAccount = this.encrypt(account);
      if (!encryptedAccount) {
        console.error('Failed to encrypt account data');
        return false;
      }
      localStorage.setItem(this.defaultAccountKey, encryptedAccount);
      console.log('Default account stored successfully');
      return true;
    } catch (error) {
      console.error('Failed to set default account:', error);
      return false;
    }
  }

  /**
   * Get default trading account with decryption
   */
  async getDefaultAccount() {
    try {
      const encryptedAccount = localStorage.getItem(this.defaultAccountKey);
      if (!encryptedAccount) {
        console.log('No default account found in storage');
        return null;
      }
      
      const decryptedAccount = this.decrypt(encryptedAccount);
      if (!decryptedAccount) {
        console.error('Failed to decrypt default account, clearing corrupted data');
        await this.clearSession();
        return null;
      }
      
      console.log('Default account retrieved:', {
        account: decryptedAccount.account,
        currency: decryptedAccount.currency
      });
      
      return decryptedAccount;
    } catch (error) {
      console.error('Failed to get default account:', error);
      await this.clearSession();
      return null;
    }
  }

  /**
   * For development testing only
   */
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
      
      const testAccount = {
        account: 'TEST123',
        token: 'test-token',
        currency: 'USD',
        balance: '0.00'
      };
      
      console.log('Creating test session:', { testUser, testAccount });
      
      const success = await this.setSession(testUser);
      if (success) {
        console.log('Test user session created, setting up accounts');
        const tradingSuccess = await this.setTradingAccounts([testAccount]);
        const defaultSuccess = await this.setDefaultAccount(testAccount);
        console.log('Test account setup:', { tradingSuccess, defaultSuccess });
      } else {
        console.error('Failed to create test user session');
      }
      return success;
    }
    return false;
  }

  /**
   * Clear session data securely
   */
  async clearSession() {
    try {
      // Clear all auth-related data
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.tradingAccountsKey);
      localStorage.removeItem(this.defaultAccountKey);

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
      // First check for Telegram WebApp user
      const hasTelegramUser = Boolean(WebApp?.initDataUnsafe?.user);
      if (hasTelegramUser) {
        console.log('Auth check: Valid Telegram user found');
        return true;
      }

      // If no Telegram user, validate stored session
      const encryptedSession = localStorage.getItem(this.storageKey);
      if (!encryptedSession) {
        console.log('Auth check: No stored session found');
        return false;
      }

      // Attempt to decrypt and validate session
      const session = this.decrypt(encryptedSession);
      if (!session || typeof session !== 'object') {
        console.error('Auth check: Invalid or corrupted session data');
        return false;
      }

      // Validate session structure
      const isValidSession = (
        // Telegram user validation
        (
          typeof session.id === 'number' &&
          typeof session.username === 'string' &&
          session.username.length > 0
        ) ||
        // OAuth user validation
        (
          typeof session.accountId === 'string' &&
          typeof session.token === 'string' &&
          typeof session.currency === 'string'
        )
      );

      if (!isValidSession) {
        console.error('Auth check: Invalid session structure');
        return false;
      }

      // Check trading accounts
      const encryptedAccounts = localStorage.getItem(this.tradingAccountsKey);
      if (!encryptedAccounts) {
        console.error('Auth check: No trading accounts found');
        return false;
      }

      const accounts = this.decrypt(encryptedAccounts);
      const hasValidAccounts = Array.isArray(accounts) && 
        accounts.length > 0 &&
        accounts.every(acc => 
          acc && 
          typeof acc.account === 'string' &&
          typeof acc.token === 'string' &&
          typeof acc.currency === 'string'
        );

      if (!hasValidAccounts) {
        console.error('Auth check: Invalid trading accounts data');
        return false;
      }

      console.log('Auth check: Valid session and trading accounts found');
      return true;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
