/**
 * Application configuration object
 * Structured for different deployment environments on Vercel
 * @typedef {Object} AppConfig
 */
export const APP_CONFIG = {
  /** API configuration for different environments */
  api: {
    baseUrl: process.env.VITE_API_BASE_URL,
  },

  /** Environment configuration */
  environment: {
    mode: process.env.VITE_BUILD_MODE || 'development',
    isDevelopment: process.env.VITE_BUILD_MODE === 'development',
    isProduction: process.env.VITE_BUILD_MODE === 'production',
    isStaging: process.env.VITE_BUILD_MODE === 'staging',
  },
};
