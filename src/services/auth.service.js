import { WebApp } from '@twa-dev/sdk';
import { APP_CONFIG } from '@/config/app.config';

class AuthService {
  constructor() {
    this.storageKey = 'auth_session';
  }

  /**
   * Initialize auth state from storage or Telegram WebApp
   */
  async initialize() {
    // Add small delay to simulate network latency in development
    if (APP_CONFIG.environment.isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Try to get stored session
    const storedSession = await this.getStoredSession();
    
    // Check if we have valid Telegram WebApp data
    const telegramUser = WebApp?.initDataUnsafe?.user;
    
    if (telegramUser) {
      // We have fresh Telegram data, update session
      await this.setSession(telegramUser);
      return true;
    } else if (storedSession) {
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
    // Here you could add additional validation logic
    // For now we'll just check if session exists
    return Boolean(session);
  }

  /**
   * Clear session data
   */
  async clearSession() {
    try {
      localStorage.removeItem(this.storageKey);
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
      const sessionStr = localStorage.getItem(this.storageKey);
      const hasStoredSession = Boolean(sessionStr);
      const hasTelegramUser = Boolean(WebApp?.initDataUnsafe?.user);
      return hasStoredSession || hasTelegramUser;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
