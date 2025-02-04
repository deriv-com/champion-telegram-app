import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes.config';
import { AES, enc } from 'crypto-js';
import { WebApp } from '@twa-dev/sdk';
import websocketService from './websocket.service';

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

    // Track last authorized token to prevent duplicate calls
    this._lastAuthorizedToken = null;
  }

  /**
   * Authorize user account with the given token
   * Uses the authorize API to authenticate the user's selected/default account
   * Note: WebSocket connection should already be established by App initialization
   * @param {string} token Authorization token for the account
   * @returns {Promise<boolean>} True if account authorization was successful
   */
  async authorizeAccount(token) {
    try {
      const ws = websocketService.instance;
      
      // Check if WebSocket is already connected and authorized with this token
      if (ws.isConnected() && ws.currentToken === token) {
        console.log('WebSocket already connected and authorized with current token');
        return true;
      }

      // Only authorize if WebSocket is connected but not authorized, or has different token
      if (ws.isConnected() && ws.currentToken !== token) {
        await ws.api.auth.authorize(token);
        console.log('WebSocket re-authorized with new token');
      }
      
      ws.currentToken = token;
      return true;
    } catch (error) {
      console.error('Account authorization failed:', error);
      this._lastAuthorizedToken = null;
      return false;
    }
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
      // Check if we have valid Telegram WebApp data first
      const telegramUser = WebApp?.initDataUnsafe?.user;
      if (telegramUser) {
        // We have fresh Telegram data, update session
        const success = await this.setSession(telegramUser);
        
        // Set up accounts for Telegram users if not exists
        const existingAccount = await this.getDefaultAccount();
        let account = existingAccount;
        
        // TODO: Remove this once we implement Telegram login
        if (!existingAccount && success) {
          account = {
            account: `TG${telegramUser.id}`,
            token: 'telegram-token',
            currency: 'USD',
            balance: '0.00'
          };
          await this.setTradingAccounts([account]);
          await this.setDefaultAccount(account);
        }
        
        return true;
      }
      
      // Fall back to stored session if no Telegram data
      const storedSession = await this.getStoredSession();
      if (storedSession) {
        // We have stored session, validate it
        const isValid = await this.validateSession(storedSession);
        return isValid;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Store session data with encryption
   */
  async setSession(userData) {
    try {
      console.log('Setting session for user:', userData);
      
      // Check storage availability first
      if (!this.isStorageAvailable()) {
        console.warn('localStorage is not available in this context');
        // Store in memory as fallback
        this._memorySession = userData;
        return true;
      }

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
      // Store in memory as fallback
      this._memorySession = userData;
      return true;
    }
  }

  /**
   * Get stored session from localStorage with decryption
   */
  async getStoredSession() {
    try {
      // Check memory first
      if (this._memorySession) {
        console.log('Retrieved session from memory');
        return this._memorySession;
      }

      // Then try localStorage if available
      if (!this.isStorageAvailable()) {
        console.warn('localStorage is not available in this context');
        return null;
      }

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
            typeof session.currency === 'string' &&
            typeof session.loginTime === 'number' &&
            // Validate session is not expired (24 hours)
            Date.now() - session.loginTime < APP_CONFIG.security.tokenExpiry
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

      // For OAuth sessions, ensure default account matches session
      if (session.accountId && defaultAccount) {
        const isValidDefaultAccount = 
          defaultAccount.account === session.accountId &&
          defaultAccount.token === session.token &&
          defaultAccount.currency === session.currency;
        
        if (!isValidDefaultAccount) {
          console.error('Default account does not match session data');
          await this.clearSession();
          return false;
        }
      }

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
      // Store in memory first
      this._memoryTradingAccounts = accounts;

      // Then try localStorage if available
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, using memory storage for trading accounts');
        return true;
      }

      const encryptedAccounts = this.encrypt(accounts);
      if (!encryptedAccounts) return false;
      localStorage.setItem(this.tradingAccountsKey, encryptedAccounts);
      return true;
    } catch (error) {
      console.error('Failed to store trading accounts:', error);
      // Fallback to memory storage
      this._memoryTradingAccounts = accounts;
      return true;
    }
  }

  /**
   * Get stored trading accounts with decryption
   */
  async getTradingAccounts() {
    try {
      // Check memory first
      if (this._memoryTradingAccounts) {
        console.log('Retrieved trading accounts from memory');
        return this._memoryTradingAccounts;
      }

      // Then try localStorage if available
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available for trading accounts');
        return null;
      }

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
      
      // Store account first
      this._memoryDefaultAccount = account;

      // Try localStorage if available
      if (this.isStorageAvailable()) {
        const encryptedAccount = this.encrypt(account);
        if (!encryptedAccount) {
          console.error('Failed to encrypt account data');
          return false;
        }
        
        localStorage.setItem(this.defaultAccountKey, encryptedAccount);
        console.log('Default account stored successfully');
      } else {
        console.warn('localStorage not available, using memory storage for default account');
      }

      // Only authorize if WebSocket connection needs it
      await this.authorizeAccount(account.token);
      return true;
    } catch (error) {
      console.error('Failed to set default account:', error);
      // Fallback to memory storage
      this._memoryDefaultAccount = account;
      return true;
    }
  }

  /**
   * Get default trading account with decryption
   */
  async getDefaultAccount() {
    try {
      // Check memory first
      if (this._memoryDefaultAccount) {
        console.log('Retrieved default account from memory');
        return this._memoryDefaultAccount;
      }

      // Then try localStorage if available
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available for default account');
        return null;
      }

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
      // Clear memory storage first
      this._memorySession = null;
      this._memoryTradingAccounts = null;
      this._memoryDefaultAccount = null;
      this._lastAuthorizedToken = null;

      // Try to clear localStorage if available
      if (this.isStorageAvailable()) {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.tradingAccountsKey);
        localStorage.removeItem(this.defaultAccountKey);
      }

      // Close WebSocket connection
      const ws = websocketService.instance;
      if (ws.isConnected()) {
        await ws.unsubscribeAll().catch(console.error);
        ws.close();
      }

      // Add small delay in development
      if (APP_CONFIG.environment.isDevelopment) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Use replace() for more reliable navigation during cleanup
      window.location.replace(ROUTES.HOME);
      return true;
    } catch (error) {
      console.error('Failed to clear session:', error);
      // Still try to clear memory storage even if localStorage clear failed
      this._memorySession = null;
      this._memoryTradingAccounts = null;
      this._memoryDefaultAccount = null;
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

      // Check memory storage first
      if (this._memorySession && this._memoryTradingAccounts) {
        console.log('Auth check: Valid session found in memory');
        return true;
      }

      // If no memory storage and localStorage is not available, return false
      if (!this.isStorageAvailable()) {
        console.warn('Auth check: localStorage not available and no memory session found');
        return false;
      }

      // If no Telegram user or memory storage, validate localStorage session
      const encryptedSession = localStorage.getItem(this.storageKey);
      if (!encryptedSession) {
        console.log('Auth check: No session found in storage');
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
          typeof session.currency === 'string' &&
          typeof session.loginTime === 'number' &&
          // Validate session is not expired (24 hours)
          Date.now() - session.loginTime < APP_CONFIG.security.tokenExpiry
        )
      );

      if (!isValidSession) {
        console.error('Auth check: Invalid session structure');
        return false;
      }

      // Check trading accounts - first in memory, then in localStorage
      if (this._memoryTradingAccounts) {
        const hasValidMemoryAccounts = Array.isArray(this._memoryTradingAccounts) && 
          this._memoryTradingAccounts.length > 0 &&
          this._memoryTradingAccounts.every(acc => 
            acc && 
            typeof acc.account === 'string' &&
            typeof acc.token === 'string' &&
            typeof acc.currency === 'string'
          );

        if (hasValidMemoryAccounts) {
          console.log('Auth check: Valid trading accounts found in memory');
          return true;
        }
      }

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