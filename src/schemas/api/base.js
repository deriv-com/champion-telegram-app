/**
 * Base request/response types for WebSocket API
 */

/**
 * @typedef {Object} BaseRequest
 * @property {number} [req_id] Request ID
 * @property {Object} [passthrough] Custom passthrough data
 */

/**
 * @typedef {Object} BaseResponse
 * @property {number} req_id Request ID
 * @property {string} msg_type Message type
 * @property {Object} [error] Error details
 * @property {string} [error.code] Error code
 * @property {string} [error.message] Error message
 */

/**
 * @typedef {Object} ApiEndpoint
 * @property {string} name Endpoint name
 * @property {string} description Endpoint description
 * @property {string} method API method name
 * @property {boolean} [isSubscription] Whether endpoint is subscription-based
 * @property {Object} requestSchema Request validation schema
 * @property {Object} responseSchema Response validation schema
 */

/**
 * @typedef {Object} ApiCategory
 * @property {string} name Category name
 * @property {string} description Category description
 * @property {Object.<string, ApiEndpoint>} endpoints Available endpoints
 */

export const API_METHODS = {
  ASSET_INDEX: 'asset_index',
  ACTIVE_SYMBOLS: 'active_symbols',
  CONTRACTS_FOR: 'contracts_for',
  PROPOSAL: 'proposal',
  TICKS: 'ticks',
  TICKS_HISTORY: 'ticks_history',
  TRADING_TIMES: 'trading_times'
};
