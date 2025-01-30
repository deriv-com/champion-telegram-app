/**
 * WebSocket error codes and messages
 * Based on https://developers.deriv.com/docs/websockets
 */
export const WS_ERROR_CODES = {
  // Authentication errors
  AuthorizationRequired: 'AuthorizationRequired',
  InvalidToken: 'InvalidToken',
  InvalidAppID: 'InvalidAppID',

  // Rate limiting
  RateLimit: 'RateLimit',
  TooManyRequests: 'TooManyRequests',

  // Market errors
  MarketIsClosed: 'MarketIsClosed',
  MarketIsDisabled: 'MarketIsDisabled',

  // Contract errors
  ContractValidationError: 'ContractValidationError',
  InvalidContractProposal: 'InvalidContractProposal',
  ContractBuyValidationError: 'ContractBuyValidationError',

  // Input validation
  InputValidationFailed: 'InputValidationFailed',
  ParameterValidationFailed: 'ParameterValidationFailed',

  // Permission errors
  PermissionDenied: 'PermissionDenied',
  InvalidPermissions: 'InvalidPermissions',

  // Connection errors
  StreamingNotAllowed: 'StreamingNotAllowed',
  SubscriptionError: 'SubscriptionError'
};

/**
 * WebSocket message types
 */
export const WS_MESSAGE_TYPES = {
  // Authentication
  Authorize: 'authorize',
  Logout: 'logout',

  // Market data
  Ticks: 'ticks',
  ActiveSymbols: 'active_symbols',
  ContractsFor: 'contracts_for',
  PriceProposal: 'proposal',
  TradingTimes: 'trading_times',
  ServerTime: 'time',
  TicksHistory: 'ticks_history',
  PriceHistory: 'candles',

  // Trading
  Buy: 'buy',
  Sell: 'sell',
  Cancel: 'cancel',
  ProposalOpenContract: 'proposal_open_contract',
  Portfolio: 'portfolio',
  ProfitTable: 'profit_table',
  Statement: 'statement',

  // Account
  Balance: 'balance',
  AccountSettings: 'get_settings',
  UpdateSettings: 'set_settings',
  AccountStatus: 'get_account_status',
  AccountLimits: 'get_limits',
  SelfExclusion: 'get_self_exclusion',
  SetSelfExclusion: 'set_self_exclusion',
  AccountList: 'account_list',

  // Subscription management
  Forget: 'forget',
  ForgetAll: 'forget_all',

  // System
  Ping: 'ping',
  Website: 'website_status'
};

/**
 * WebSocket subscription types
 */
export const WS_SUBSCRIPTION_TYPES = {
  Ticks: 'ticks',
  Proposal: 'proposal',
  Balance: 'balance',
  Portfolio: 'portfolio',
  OpenContract: 'proposal_open_contract'
};

/**
 * WebSocket error messages
 */
export const WS_ERROR_MESSAGES = {
  [WS_ERROR_CODES.AuthorizationRequired]: 'Authorization is required for this request',
  [WS_ERROR_CODES.InvalidToken]: 'Invalid or expired authorization token',
  [WS_ERROR_CODES.InvalidAppID]: 'Invalid application ID',
  [WS_ERROR_CODES.RateLimit]: 'Rate limit reached',
  [WS_ERROR_CODES.TooManyRequests]: 'Too many requests',
  [WS_ERROR_CODES.MarketIsClosed]: 'This market is currently closed',
  [WS_ERROR_CODES.MarketIsDisabled]: 'This market is currently disabled',
  [WS_ERROR_CODES.ContractValidationError]: 'Contract validation error',
  [WS_ERROR_CODES.InvalidContractProposal]: 'Invalid contract proposal parameters',
  [WS_ERROR_CODES.ContractBuyValidationError]: 'Contract buy validation error',
  [WS_ERROR_CODES.InputValidationFailed]: 'Input validation failed',
  [WS_ERROR_CODES.ParameterValidationFailed]: 'Parameter validation failed',
  [WS_ERROR_CODES.PermissionDenied]: 'Permission denied',
  [WS_ERROR_CODES.InvalidPermissions]: 'Invalid permissions',
  [WS_ERROR_CODES.StreamingNotAllowed]: 'Streaming is not allowed for this endpoint',
  [WS_ERROR_CODES.SubscriptionError]: 'Subscription error'
};

/**
 * WebSocket connection states
 */
export const WS_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

/**
 * WebSocket close codes
 * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
 */
export const WS_CLOSE_CODES = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS: 1005,
  ABNORMAL_CLOSURE: 1006,
  INVALID_FRAME_PAYLOAD_DATA: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MISSING_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  TLS_HANDSHAKE: 1015
};
