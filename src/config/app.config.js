// Validate required environment variables
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_WS_URL',
  'VITE_WS_APP_ID',
  'VITE_ENCRYPTION_KEY',
  'VITE_DERIV_OAUTH_URL',
  'VITE_DERIV_SIGNUP_URL'
];

const validateEnvVars = () => {
  const missing = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Call during app initialization
validateEnvVars();

/**
 * Application configuration object
 * Structured for different deployment environments
 * @typedef {Object} AppConfig
 */
export const APP_CONFIG = {
  /** App settings that can be configured through UI */
  app_settings: {
    api_url: import.meta.env.VITE_API_BASE_URL,
    websocket_url: import.meta.env.VITE_WS_URL,
    app_id: import.meta.env.VITE_WS_APP_ID,
    brand: import.meta.env.VITE_WS_BRAND || 'deriv',
    lang: import.meta.env.VITE_WS_LANG || 'en'
  },

  /** API configuration */
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    errorLoggingUrl: import.meta.env.VITE_ERROR_LOGGING_URL,
    websocket: {
      get url() { return APP_CONFIG.app_settings.websocket_url },
      get appId() { return APP_CONFIG.app_settings.app_id },
      get brand() { return APP_CONFIG.app_settings.brand },
      get lang() { return APP_CONFIG.app_settings.lang },
      maxReconnectAttempts: parseInt(import.meta.env.VITE_MAX_RECONNECT_ATTEMPTS) || 3,
      reconnectTimeout: parseInt(import.meta.env.VITE_RECONNECT_TIMEOUT) || 500,
      connectionTimeout: parseInt(import.meta.env.VITE_CONNECTION_TIMEOUT) || 5000,
      heartbeatInterval: parseInt(import.meta.env.VITE_HEARTBEAT_INTERVAL) || 15000,
    },
  },

  /** Environment configuration */
  environment: {
    mode: import.meta.env.VITE_BUILD_MODE || 'development',
    isDevelopment: import.meta.env.VITE_BUILD_MODE === 'development',
    isProduction: import.meta.env.VITE_BUILD_MODE === 'production',
    isStaging: import.meta.env.VITE_BUILD_MODE === 'staging',
  },

  /** Security configuration */
  security: {
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY,
    tokenExpiry: parseInt(import.meta.env.VITE_TOKEN_EXPIRY) || 86400000, // 24 hours
    cors: {
      enabled: import.meta.env.VITE_CORS_ENABLED === 'true',
      allowedOrigins: import.meta.env.VITE_ALLOWED_ORIGINS?.split(',') || [],
    },
    rateLimit: {
      maxRequests: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS) || 100,
      windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS) || 60000,
    },
  },

  /** Auth configuration */
  auth: {
    /** External Deriv OAuth URL for authentication */
    get oauthUrl() {
      const baseUrl = import.meta.env.VITE_DERIV_OAUTH_URL;
      const appId = APP_CONFIG.app_settings.app_id;
      return `${baseUrl}?app_id=${appId}`;
    },
    /** External Deriv signup page URL */
    signupUrl: import.meta.env.VITE_DERIV_SIGNUP_URL,
  },

  /** Telegram configuration */
  telegram: {
    /** Validate Telegram WebApp initialization */
    validateInitData: async (initData) => {
      if (!initData) return false;

      try {
        const data = JSON.parse(initData);
        if (!data.user || !data.auth_date || !data.hash) {
          return false;
        }

        // Check if auth_date is within last 24 hours
        const authDate = parseInt(data.auth_date) * 1000;
        const now = Date.now();
        if (now - authDate > 86400000) {
          return false;
        }

        // Note: Hash validation should be done on the server side
        // Frontend only checks for presence of required fields and timestamp
        return true;
      } catch (error) {
        console.error('Failed to validate Telegram init data:', error);
        return false;
      }
    },
  },
};
