import { Validator } from '@/utils/validator.js';
import { API_METHODS } from '@/schemas/api/base.js';

export class BaseApi {
  constructor(ws, options = {}) {
    if (!ws) {
      throw new Error('WebSocket instance is required');
    }
    this.ws = ws;
    this.endpoints = {};
  }

  _formatRequest(request, options = {}) {
    return {
      ...request,
      passthrough: options.passthrough,
      req_id: options.reqId || Math.floor(Math.random() * 1000000) + 1
    };
  }

  async send(endpoint, request, options = {}) {
    try {
      if (!this.ws.isConnected()) {
        await this.ws.connect();
      }

      const formattedRequest = { ...request };
      
      if (!formattedRequest[endpoint.method]) {
        formattedRequest[endpoint.method] = endpoint.method === API_METHODS.ACTIVE_SYMBOLS ? 'brief' : 1;
      }
      
      const validatedRequest = Validator.validateRequest(endpoint, formattedRequest);
      const finalRequest = this._formatRequest(validatedRequest, options);
      const response = await this.ws.send(finalRequest, options);
      return Validator.validateResponse(endpoint, response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async subscribe(endpoint, request, callback, options = {}) {
    try {
      if (!this.ws.isConnected()) {
        await this.ws.connect();
      }

      const validatedRequest = Validator.validateRequest(endpoint, request);
      const subscription = await this.ws.subscribe(
        {
          ...this._formatRequest(validatedRequest, options),
          subscribe: 1
        },
        (response) => {
          try {
            const validatedResponse = Validator.validateResponse(endpoint, response);
            callback(validatedResponse);
          } catch (error) {
            console.error('Subscription validation failed:', error.message);
          }
        },
        options
      );

      return {
        reqId: subscription.reqId,
        request: validatedRequest
      };
    } catch (error) {
      console.error('Subscription failed:', error.message);
      throw error;
    }
  }

  createApiError(errorResponse) {
    const error = new Error(errorResponse.message);
    Object.assign(error, {
      code: errorResponse.code,
      details: errorResponse.details,
      name: this._getErrorName(errorResponse.code)
    });
    return error;
  }

  _getErrorName(code) {
    switch (code) {
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
      case 'NetworkError':
      case 'ConnectionLost':
        return 'NetworkError';
      case 'RequestTimeout':
        return 'TimeoutError';
      case 'InternalServerError':
      case 'ServiceUnavailable':
      case 'MaintenanceError':
        return 'ServerError';
      case 'RateLimit':
      case 'ConcurrentRequestLimit':
        return 'RateLimitError';
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

  formatRequestParams(params) {
    const formatted = {};
    Object.entries(params).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      formatted[snakeKey] = value;
    });
    return formatted;
  }

  formatResponseData(response) {
    const formatted = {};
    Object.entries(response).forEach(([key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      formatted[camelKey] = value;
    });
    return formatted;
  }
}