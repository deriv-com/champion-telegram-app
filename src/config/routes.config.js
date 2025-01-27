/**
 * Application route paths
 * @constant {Object} ROUTES
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};

/**
 * Routes that require authentication
 * @constant {Array} PROTECTED_ROUTES
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
];
