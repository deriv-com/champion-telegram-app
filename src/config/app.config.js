export const APP_CONFIG = {
  name: process.env.VITE_APP_NAME || 'Champion Trade',
  url: process.env.VITE_APP_URL,
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  },
  telegram: {
    botUsername: process.env.VITE_TELEGRAM_BOT_USERNAME,
    botToken: process.env.VITE_TELEGRAM_BOT_TOKEN,
  },
  features: {
    enableAnalytics: process.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDarkMode: process.env.VITE_ENABLE_DARK_MODE === 'true',
  },
  environment: {
    mode: process.env.VITE_BUILD_MODE || 'development',
    isDevelopment: process.env.VITE_BUILD_MODE === 'development',
    isProduction: process.env.VITE_BUILD_MODE === 'production',
    isStaging: process.env.VITE_BUILD_MODE === 'staging',
  },
};
