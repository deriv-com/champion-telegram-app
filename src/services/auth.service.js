import { WebApp } from '@twa-dev/sdk';
import { APP_CONFIG } from '@/config/app.config';

class AuthService {
  constructor() {
    this.storageKey = 'auth_session';
  }

  /**
   * Initialize auth state from storage or Telegram WebApp
   */
  initialize() {
    // Try to get stored session
    const storedSession = this.getStoredSession();
    
    // Check if we have valid Telegram WebApp data
    const telegramUser = WebApp?.initDataUnsafe?.user;
    
    if (telegramUser) {
      // We have fresh Telegram data, update session
      this.setSession(telegramUser);
      return true;
    } else if (storedSession) {
      // We have stored session, validate it
      return this.validateSession(storedSession);
    }
    
    return false;
  }

  // For development testing only
  createTestSession() {
    if (APP_CONFIG.environment.isDevelopment) {
      const testUser = {
        id: 12345,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser'
      };
      this.setSession(testUser);
      return true;
    }
    return false;
  }

  /**
   * Get stored session from localStorage
   */
  getStoredSession() {
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
  setSession(userData) {
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
  validateSession(session) {
    // Here you could add additional validation logic
    // For now we'll just check if session exists
    return Boolean(session);
  }

  /**
   * Clear session data
   */
  clearSession() {
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
   */
  isAuthenticated() {
    return Boolean(this.getStoredSession() || WebApp?.initDataUnsafe?.user);
  }
}

export const authService = new AuthService();
