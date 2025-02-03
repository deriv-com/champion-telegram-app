/**
 * Base class for WebSocket API endpoints
 * Based on https://developers.deriv.com/docs/websockets
 */
export class BaseApi {
  constructor(websocket) {
    if (!websocket) {
      throw new Error('WebSocket instance is required');
    }
    this.ws = websocket;
  }

  /**
   * Send a request through WebSocket
   * @param {Object} request Request object
   * @param {Object} options Request options
   * @returns {Promise} Promise that resolves with the response
   */
  send(request, options = {}) {
    return this.ws.send({
      ...request,
      passthrough: options.passthrough,
      req_id: options.reqId
    }, options);
  }

  /**
   * Subscribe to a WebSocket stream
   * @param {Object} request Subscription request
   * @param {Function} callback Callback function
   * @param {Object} options Subscription options
   * @returns {Promise} Promise that resolves with subscription details
   */
  subscribe(request, callback, options = {}) {
    return this.ws.subscribe({
      ...request,
      subscribe: 1,
      passthrough: options.passthrough,
      req_id: options.reqId
    }, callback, options);
  }

  /**
   * Create an API error from response
   * @param {Object} errorResponse Error response from API
   * @returns {Error} Enhanced error object
   */
  createApiError(errorResponse) {
    // Error codes from https://developers.deriv.com/docs/error-codes
    const error = new Error(errorResponse.message);
    error.code = errorResponse.code;
    error.details = errorResponse.details;
    
    // Map error codes to specific error types
    switch (error.code) {
      // Authentication & Authorization
      case 'AuthorizationRequired':
        error.name = 'AuthorizationError';
        break;
      case 'InvalidAppID':
        error.name = 'ConfigurationError';
        break;
      case 'InputValidationFailed':
        error.name = 'ValidationError';
        break;
      case 'PermissionDenied':
        error.name = 'PermissionError';
        break;
      case 'InvalidToken':
        error.name = 'AuthenticationError';
        break;

      // Network Related
      case 'NetworkError':
        error.name = 'NetworkError';
        break;
      case 'ConnectionLost':
        error.name = 'NetworkError';
        break;
      case 'RequestTimeout':
        error.name = 'TimeoutError';
        break;

      // Server Errors
      case 'InternalServerError':
        error.name = 'ServerError';
        break;
      case 'ServiceUnavailable':
        error.name = 'ServerError';
        break;
      case 'MaintenanceError':
        error.name = 'ServerError';
        break;

      // Rate Limiting
      case 'RateLimit':
        error.name = 'RateLimitError';
        break;
      case 'ConcurrentRequestLimit':
        error.name = 'RateLimitError';
        break;

      // Business Logic Errors
      case 'MarketIsClosed':
        error.name = 'MarketError';
        break;
      case 'ContractValidationError':
        error.name = 'ContractError';
        break;
      case 'ResourceNotFound':
        error.name = 'NotFoundError';
        break;
      case 'DataError':
        error.name = 'DataProcessingError';
        break;

      default:
        error.name = 'ApiError';
    }

    return error;
  }

  /**
   * Format request parameters
   * @param {Object} params Request parameters
   * @returns {Object} Formatted parameters
   */
  formatRequestParams(params) {
    const formatted = {};
    
    // Convert camelCase to snake_case
    Object.entries(params).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      formatted[snakeKey] = value;
    });

    return formatted;
  }

  /**
   * Format response data
   * @param {Object} response Response from API
   * @returns {Object} Formatted response
   */
  formatResponseData(response) {
    const formatted = {};
    
    // Convert snake_case to camelCase
    Object.entries(response).forEach(([key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      formatted[camelKey] = value;
    });

    return formatted;
  }

  /**
   * Validate required parameters
   * @param {Object} params Parameters to validate
   * @param {Array<string>} required Required parameter names
   * @throws {Error} If required parameters are missing
   */
  validateRequired(params, required) {
    for (const param of required) {
      if (params[param] === undefined) {
        throw new Error(`${param} is required`);
      }
    }
  }

  /**
   * Validate parameter type
   * @param {*} value Value to validate
   * @param {string} type Expected type
   * @param {string} name Parameter name
   * @throws {Error} If type is invalid
   */
  validateType(value, type, name) {
    let valid = false;

    switch (type) {
      case 'string':
        valid = typeof value === 'string';
        break;
      case 'number':
        valid = typeof value === 'number';
        break;
      case 'boolean':
        valid = typeof value === 'boolean';
        break;
      case 'array':
        valid = Array.isArray(value);
        break;
      case 'object':
        valid = typeof value === 'object' && value !== null && !Array.isArray(value);
        break;
      default:
        valid = true;
    }

    if (!valid) {
      throw new Error(`${name} must be of type ${type}`);
    }
  }

  /**
   * Validate parameter value against enum
   * @param {*} value Value to validate
   * @param {Array} enumValues Allowed values
   * @param {string} name Parameter name
   * @throws {Error} If value is not in enum
   */
  validateEnum(value, enumValues, name) {
    if (!enumValues.includes(value)) {
      throw new Error(`${name} must be one of: ${enumValues.join(', ')}`);
    }
  }
}
