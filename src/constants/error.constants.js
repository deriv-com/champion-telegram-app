export const ERROR_CODES = {
  // Authentication Errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  API_ERROR: 'API_ERROR',

  // WebSocket Errors
  WS_CONNECTION_ERROR: 'WS_CONNECTION_ERROR',
  WS_CONNECTION_CLOSED: 'WS_CONNECTION_CLOSED',
  WS_MESSAGE_ERROR: 'WS_MESSAGE_ERROR',
  WS_SUBSCRIPTION_ERROR: 'WS_SUBSCRIPTION_ERROR',

  // Trading Errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_TRADE_PARAMS: 'INVALID_TRADE_PARAMS',
  MARKET_CLOSED: 'MARKET_CLOSED',
  POSITION_NOT_FOUND: 'POSITION_NOT_FOUND',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication is required',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid username or password',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Session has expired, please login again',
  [ERROR_CODES.TOKEN_INVALID]: 'Invalid authentication token',

  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
  [ERROR_CODES.SERVER_ERROR]: 'Server error occurred',
  [ERROR_CODES.REQUEST_TIMEOUT]: 'Request timed out',
  [ERROR_CODES.API_ERROR]: 'API error occurred',

  [ERROR_CODES.WS_CONNECTION_ERROR]: 'WebSocket connection error',
  [ERROR_CODES.WS_CONNECTION_CLOSED]: 'WebSocket connection closed',
  [ERROR_CODES.WS_MESSAGE_ERROR]: 'WebSocket message error',
  [ERROR_CODES.WS_SUBSCRIPTION_ERROR]: 'WebSocket subscription error',

  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Insufficient balance for this operation',
  [ERROR_CODES.INVALID_TRADE_PARAMS]: 'Invalid trading parameters',
  [ERROR_CODES.MARKET_CLOSED]: 'Market is currently closed',
  [ERROR_CODES.POSITION_NOT_FOUND]: 'Position not found',

  [ERROR_CODES.VALIDATION_ERROR]: 'Validation error occurred',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.REQUIRED_FIELD]: 'Required field missing',
};
