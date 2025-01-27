// REST API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',

  // Trade
  MARKETS: '/markets',
  EXECUTE_TRADE: '/trade/execute',
  TRADE_HISTORY: '/trade/history',

  // Cashier
  BALANCE: '/cashier/balance',
  DEPOSIT: '/cashier/deposit',
  WITHDRAW: '/cashier/withdraw',
  TRANSACTIONS: '/cashier/transactions',

  // Positions
  OPEN_POSITIONS: '/positions/open',
  CLOSED_POSITIONS: '/positions/closed',
  POSITION_DETAILS: (id) => `/positions/${id}`,
  UPDATE_POSITION: (id) => `/positions/${id}/update`,
  CLOSE_POSITION: (id) => `/positions/${id}/close`,
};

// WebSocket Channels
export const WS_CHANNELS = {
  // Market Data
  MARKET_PRICES: 'market_prices',
  MARKET_DEPTH: 'market_depth',
  MARKET_TRADES: 'market_trades',

  // User-specific
  USER_TRADES: 'user_trades',
  USER_ORDERS: 'user_orders',
  USER_POSITIONS: 'user_positions',
  BALANCE_UPDATES: 'balance_updates',

  // System
  SYSTEM_STATUS: 'system_status',
  NOTIFICATIONS: 'notifications',
};

// WebSocket Event Types
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTH: 'auth',

  // Subscriptions
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',

  // Market Data
  PRICE_UPDATE: 'price_update',
  DEPTH_UPDATE: 'depth_update',
  NEW_TRADE: 'new_trade',

  // User Events
  POSITION_UPDATE: 'position_update',
  ORDER_UPDATE: 'order_update',
  BALANCE_UPDATE: 'balance_update',
  
  // System Events
  STATUS_UPDATE: 'status_update',
  NOTIFICATION: 'notification',
};
