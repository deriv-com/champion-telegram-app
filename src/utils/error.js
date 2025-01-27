import { ERROR_CODES, ERROR_MESSAGES } from '@/constants/error.constants';

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
    // In development, log the full error
    if (import.meta.env.DEV) {
      console.error('Error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack,
      });
    } else {
      // In production, log to error tracking service
      // TODO: Implement production error logging
      console.error('Error:', {
        code: error.code,
        message: error.message,
      });
    }
  },

  showErrorNotification(error) {
    // Use the Telegram WebApp's native alert for now
    // This can be replaced with a more sophisticated notification system
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(error.message);
    } else {
      alert(error.message);
    }
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
