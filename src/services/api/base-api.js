import { Validator } from '@/utils/validator.js';
import WebSocketManager from '@/services/websocket.service';

/**
 * @typedef {import('@/schemas/api/base.js').ApiEndpoint} ApiEndpoint
 * @typedef {import('@/schemas/api/base.js').BaseRequest} BaseRequest
 * @typedef {import('@/schemas/api/base.js').BaseResponse} BaseResponse
 */

/**
 * Base class for WebSocket API endpoints
 * Based on https://developers.deriv.com/docs/websockets
 */
export class BaseApi {
  /**
   * @param {WebSocketManager} websocket WebSocket manager instance
   */
  constructor(websocket) {
    if (!websocket) {
      throw new Error('WebSocket instance is required');
    }
    this.ws = websocket;
    this.endpoints = {};
  }

  /**
   * Format request with common parameters
   * @param {BaseRequest} request Original request
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @param {number} [options.timeout] Request timeout
   * @returns {BaseRequest} Formatted request with common parameters
   * @private
   */
  _formatRequest(request, options = {}) {
    return {
      ...request,
      passthrough: options.passthrough,
      req_id: options.reqId
    };
  }

  /**
   * Send a request through WebSocket
   * @param {ApiEndpoint} endpoint API endpoint definition
   * @param {BaseRequest} request Request object
   * @param {Object} [options] Request options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @param {number} [options.timeout] Request timeout
   * @returns {Promise<BaseResponse>} Promise that resolves with the response
   */
  async send(endpoint, request, options = {}) {
    // Validate request
    const validatedRequest = Validator.validateRequest(endpoint, request);

    // Send request
    const response = await this.ws.send(
      this._formatRequest(validatedRequest, options),
      options
    );

    // Validate response
    return Validator.validateResponse(endpoint, response);
  }

  /**
   * Subscribe to a WebSocket stream
   * @param {ApiEndpoint} endpoint API endpoint definition
   * @param {BaseRequest} request Subscription request
   * @param {function(BaseResponse): void} callback Callback function
   * @param {Object} [options] Subscription options
   * @param {number} [options.reqId] Custom request ID
   * @param {Object} [options.passthrough] Custom passthrough data
   * @param {number} [options.timeout] Request timeout
   * @returns {Promise<{reqId: number, request: BaseRequest}>} Promise that resolves with subscription details
   */
  async subscribe(endpoint, request, callback, options = {}) {
    // Validate request
    const validatedRequest = Validator.validateRequest(endpoint, request);

    // Subscribe
    const subscription = await this.ws.subscribe(
      {
        ...this._formatRequest(validatedRequest, options),
        subscribe: 1
      },
      (response) => {
        // Validate response before passing to callback
        try {
          const validatedResponse = Validator.validateResponse(endpoint, response);
          callback(validatedResponse);
        } catch (error) {
          console.error('Subscription response validation failed:', error);
        }
      },
      options
    );

    return {
      reqId: subscription.reqId,
      request: validatedRequest
    };
  }

  /**
   * Create an API error from response
   * @param {Object} errorResponse Error response from API
   * @param {string} errorResponse.code Error code
   * @param {string} errorResponse.message Error message
   * @param {*} [errorResponse.details] Additional error details
   * @returns {Error} Enhanced error object
   */
  createApiError(errorResponse) {
    // Error codes from https://developers.deriv.com/docs/error-codes
    const error = new Error(errorResponse.message);
    Object.assign(error, {
      code: errorResponse.code,
      details: errorResponse.details,
      name: this._getErrorName(errorResponse.code)
    });
    return error;
  }

  /**
   * Get error name based on error code
   * @param {string} code Error code
   * @returns {string} Error name
   * @private
   */
  _getErrorName(code) {
    switch (code) {
      // Authentication & Authorization
      case 'AuthorizationRequired':
        return 'AuthorizationError';
      case 'InvalidAppID':
        return 'ConfigurationError';
      case 'InputValidationFailed':
        return 'ValidationError';
      case 'PermissionDenied':
        return 'PermissionError';
      case 'InvalidToken':
        return 'AuthenticationError';

      // Network Related
      case 'NetworkError':
      case 'ConnectionLost':
        return 'NetworkError';
      case 'RequestTimeout':
        return 'TimeoutError';

      // Server Errors
      case 'InternalServerError':
      case 'ServiceUnavailable':
      case 'MaintenanceError':
        return 'ServerError';

      // Rate Limiting
      case 'RateLimit':
      case 'ConcurrentRequestLimit':
        return 'RateLimitError';

      // Business Logic Errors
      case 'MarketIsClosed':
        return 'MarketError';
      case 'ContractValidationError':
        return 'ContractError';
      case 'ResourceNotFound':
        return 'NotFoundError';
      case 'DataError':
        return 'DataProcessingError';

      default:
        return 'ApiError';
    }
  }

  /**
   * Format request parameters from camelCase to snake_case
   * @param {Object} params Request parameters
   * @returns {Object} Formatted parameters
   */
  formatRequestParams(params) {
    const formatted = {};
    
    Object.entries(params).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      formatted[snakeKey] = value;
    });

    return formatted;
  }

  /**
   * Format response data from snake_case to camelCase
   * @param {Object} response Response from API
   * @returns {Object} Formatted response
   */
  formatResponseData(response) {
    const formatted = {};
    
    Object.entries(response).forEach(([key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      formatted[camelKey] = value;
    });

    return formatted;
  }
}
