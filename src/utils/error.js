import { ERROR_CODES, ERROR_MESSAGES } from '@/constants/error.constants';
import { APP_CONFIG } from '@/config/app.config';

export class AppError extends Error {
  constructor(code, message, details = null) {
    super(message || ERROR_MESSAGES[code] || 'An unknown error occurred');
    this.code = code;
    this.details = details;
    this.isAppError = true;
  }
}

export const errorHandler = {
  handle(error, options = {}) {
    const {
      showNotification = true,
      logError = true,
      throwError = false,
    } = options;

    if (logError) {
      this.logError(error);
    }

    const appError = this.normalizeError(error);

    if (showNotification) {
      this.showErrorNotification(appError);
    }

    if (throwError) {
      throw appError;
    }

    return appError;
  },

  normalizeError(error) {
    if (error.isAppError) {
      return error;
    }

    // Handle Axios errors
    if (error.isAxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;

      switch (status) {
        case 401:
          return new AppError(ERROR_CODES.AUTH_REQUIRED, data?.message);
        case 403:
          return new AppError(ERROR_CODES.TOKEN_INVALID, data?.message);
        case 404:
          return new AppError(ERROR_CODES.API_ERROR, data?.message);
        case 422:
          return new AppError(ERROR_CODES.VALIDATION_ERROR, data?.message, data?.errors);
        case 500:
          return new AppError(ERROR_CODES.SERVER_ERROR, data?.message);
        default:
          return new AppError(
            ERROR_CODES.API_ERROR,
            data?.message || error.message,
            { status, data }
          );
      }
    }

    // Handle WebSocket errors
    if (error.type === 'websocket') {
      return new AppError(ERROR_CODES.WS_CONNECTION_ERROR, error.message);
    }

    // Handle network errors
    if (error.name === 'NetworkError') {
      return new AppError(ERROR_CODES.NETWORK_ERROR, error.message);
    }

    // Handle other errors
    return new AppError(ERROR_CODES.SERVER_ERROR, error.message);
  },

  logError(error) {
    const errorData = {
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      environment: APP_CONFIG.environment.mode,
      // Remove sensitive data
      details: this.sanitizeErrorDetails(error.details),
    };

    if (APP_CONFIG.environment.isDevelopment) {
      console.error('Error:', { ...errorData, stack: error.stack });
    } else {
      // Production error logging
      this.logToErrorService(errorData);
    }
  },

  sanitizeErrorDetails(details) {
    if (!details) return null;
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'credentials'];
    return JSON.parse(JSON.stringify(details, (key, value) => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        return '[REDACTED]';
      }
      return value;
    }));
  },

  async logToErrorService(errorData) {
    if (!APP_CONFIG.api.errorLoggingUrl) {
      console.error('Error logging URL not configured');
      return;
    }

    try {
      const response = await fetch(APP_CONFIG.api.errorLoggingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Source': 'champion-telegram-app',
        },
        body: JSON.stringify(errorData),
      });

      if (!response.ok) {
        throw new Error(`Error logging failed: ${response.statusText}`);
      }
    } catch (e) {
      // Fallback to console in case error service is down
      console.error('Failed to log error:', e);
      console.error('Original error:', errorData);
    }
  },

  showErrorNotification(error) {
    const message = this.formatErrorMessage(error);
    
    // Use the Telegram WebApp's native alert in production
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else if (APP_CONFIG.environment.isDevelopment) {
      // In development, show more details
      console.error('Error details:', error);
      alert(`${message}\n\nCheck console for details.`);
    } else {
      alert(message);
    }
  },

  formatErrorMessage(error) {
    // Format user-friendly error message
    let message = error.message;

    // Add error code if available
    if (error.code) {
      message = `[${error.code}] ${message}`;
    }

    // Add specific handling for known error types
    if (this.isNetworkError(error)) {
      message = 'Network error: Please check your connection and try again.';
    } else if (this.isAuthError(error)) {
      message = 'Authentication error: Please log in again.';
    }

    return message;
  },

  isAppError(error) {
    return error instanceof AppError;
  },

  isNetworkError(error) {
    return error.code === ERROR_CODES.NETWORK_ERROR;
  },

  isAuthError(error) {
    return [
      ERROR_CODES.AUTH_REQUIRED,
      ERROR_CODES.TOKEN_EXPIRED,
      ERROR_CODES.TOKEN_INVALID,
    ].includes(error.code);
  },
};
