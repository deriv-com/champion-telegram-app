/**
 * Application route paths
 * @constant {Object} ROUTES
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TRADE: '/dashboard/trade',
  CASHIER: '/dashboard/cashier',
  POSITIONS: '/dashboard/positions',
};

/**
 * Routes that require authentication
 * @constant {Array} PROTECTED_ROUTES
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.TRADE,
  ROUTES.CASHIER,
  ROUTES.POSITIONS,
];
