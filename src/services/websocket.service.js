import { APP_CONFIG } from '@/config/app.config';
import { AuthApi } from './api/auth-api';
import { MarketApi } from './api/market-api';
import { TradingApi } from './api/trading-api';
import { AccountApi } from './api/account-api';
import {
  WS_ERROR_CODES,
  WS_ERROR_MESSAGES,
  WS_READY_STATE,
  WS_CLOSE_CODES,
  WS_MESSAGE_TYPES
} from '@/constants/websocket.constants';

/**
 * WebSocket manager for Deriv API
 * Based on https://developers.deriv.com/docs/websockets
 */
class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reqId = 1;
    this.callHistory = new Map();
    this.subscriptions = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = APP_CONFIG.api.websocket.maxReconnectAttempts;
    this.reconnectTimeout = APP_CONFIG.api.websocket.reconnectTimeout;
    this.connectionTimeout = APP_CONFIG.api.websocket.connectionTimeout;
    this.heartbeatInterval = null;
    this.eventListeners = new Map();

    // Initialize API modules
    this.auth = new AuthApi(this);
    this.market = new MarketApi(this);
    this.trading = new TradingApi(this);
    this.account = new AccountApi(this);
  }

  /**
   * Get WebSocket URL based on environment
   * @returns {string} WebSocket URL with query parameters
   */
  getWebSocketUrl() {
    const isProduction = APP_CONFIG.environment.isProduction;
    const baseUrl = isProduction 
      ? import.meta.env.VITE_WS_PROD_URL 
      : import.meta.env.VITE_WS_DEV_URL;
    
    const appId = isProduction 
      ? import.meta.env.VITE_WS_PROD_APP_ID 
      : import.meta.env.VITE_WS_DEV_APP_ID;
    
    const brand = import.meta.env.VITE_WS_BRAND;
    const lang = import.meta.env.VITE_WS_LANG;
    
    // For development, replace the QA box number if specified
    let url = baseUrl;
    if (!isProduction && import.meta.env.VITE_WS_QA_BOX) {
      url = url.replace(/qa\d+/, import.meta.env.VITE_WS_QA_BOX);
    }
    
    return `${url}?app_id=${appId}&brand=${brand}&lang=${lang}`;
  }

  /**
   * Connect to WebSocket server
   * @returns {Promise<void>} Resolves when connected
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WS_READY_STATE.OPEN) {
        resolve();
        return;
      }

      const url = this.getWebSocketUrl();
      this.ws = new WebSocket(url);

      // Set up connection timeout
      const connectionTimeoutId = setTimeout(() => {
        if (this.ws?.readyState !== WS_READY_STATE.OPEN) {
          const error = new Error('Connection timeout');
          this.handleError(error);
          reject(error);
        }
      }, this.connectionTimeout);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeoutId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
        resolve();
      };

      this.ws.onclose = (event) => {
        this.handleDisconnect(event);
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeoutId);
        this.handleError(error);
        reject(error);
      };

      this.ws.onmessage = this.handleMessage.bind(this);
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WS_READY_STATE.OPEN) {
        this.send({ 
          [WS_MESSAGE_TYPES.Ping]: 1,
          req_id: this.reqId++
        }).catch(error => {
          console.error('Heartbeat failed:', error);
        });
      }
    }, APP_CONFIG.api.websocket.heartbeatInterval);
  }

  /**
   * Handle WebSocket disconnection
   * @param {CloseEvent} event Close event
   */
  handleDisconnect(event) {
    this.isConnected = false;
    this.cleanup();

    // Emit disconnect event with details
    this.emit('disconnected', {
      code: event.code,
      reason: event.reason || WS_ERROR_MESSAGES[event.code],
      wasClean: event.wasClean
    });

    // Attempt reconnection unless it was a clean close
    if (!event.wasClean && event.code !== WS_CLOSE_CODES.NORMAL_CLOSURE) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error('Max reconnection attempts reached');
      this.emit('error', error);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay
    });

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Clear call history timeouts and reject pending calls
    this.callHistory.forEach(({ reject, timeout }) => {
      if (timeout) clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.callHistory.clear();

    // Clear subscriptions
    this.subscriptions.clear();
  }

  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event Message event
   */
  handleMessage(event) {
    let response;
    try {
      response = JSON.parse(event.data);
    } catch (error) {
      console.error('Failed to parse message:', error);
      return;
    }

    // Handle ping/pong
    if (response.ping || response.pong) {
      this.emit('heartbeat', response);
      return;
    }

    // Emit raw message for debugging
    this.emit('message', response);

    // Handle errors
    if (response.error) {
      this.handleErrorResponse(response);
      return;
    }

    // Get original request from call history
    const call = this.callHistory.get(response.req_id);
    if (!call) {
      // Handle subscription updates
      this.handleSubscriptionUpdate(response);
      return;
    }

    // Clear timeout if exists
    if (call.timeout) {
      clearTimeout(call.timeout);
    }

    // Handle response based on request type
    if (call.request.subscribe === 1) {
      this.handleSubscriptionResponse(response, call);
    } else {
      this.handleCallResponse(response, call);
    }
  }

  /**
   * Handle error responses
   * @param {Object} response Error response
   */
  handleErrorResponse(response) {
    const error = new Error(response.error.message || WS_ERROR_MESSAGES[response.error.code]);
    error.code = response.error.code;
    error.details = response.error.details;

    // Emit error event
    this.emit('error', error);

    // Reject corresponding call if exists
    const call = this.callHistory.get(response.req_id);
    if (call) {
      call.reject(error);
      this.callHistory.delete(response.req_id);
    }
  }

  /**
   * Handle subscription updates
   * @param {Object} response Subscription update
   */
  handleSubscriptionUpdate(response) {
    const subscription = this.subscriptions.get(response.subscription?.id);
    if (subscription?.callback) {
      try {
        subscription.callback(response);
      } catch (error) {
        console.error('Subscription callback error:', error);
      }
    }
  }

  /**
   * Handle subscription responses
   * @param {Object} response Response object
   * @param {Object} call Original call details
   */
  handleSubscriptionResponse(response, call) {
    // Store subscription
    this.subscriptions.set(response.subscription?.id || response.req_id, {
      request: call.request,
      callback: call.resolve
    });

    // Resolve the promise with initial response
    call.resolve(response);
    this.callHistory.delete(response.req_id);
  }

  /**
   * Handle one-time call responses
   * @param {Object} response Response object
   * @param {Object} call Original call details
   */
  handleCallResponse(response, call) {
    call.resolve(response);
    this.callHistory.delete(response.req_id);
  }

  /**
   * Send a WebSocket request
   * @param {Object} request Request object
   * @param {Object} options Request options
   * @returns {Promise} Promise that resolves with the response
   */
  send(request, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const reqId = this.reqId++;
      const timeout = options.timeout || 10000;
      
      // Prepare the request object
      const wsRequest = {
        req_id: reqId,
        ...request,
        passthrough: options.passthrough || {},
        msg_type: options.msgType || this.getMessageType(request)
      };

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.callHistory.delete(reqId);
        reject(new Error('Request timeout'));
      }, timeout);

      // Store the call in history
      this.callHistory.set(reqId, {
        request: wsRequest,
        resolve,
        reject,
        timeout: timeoutId
      });

      // Send the request
      try {
        this.ws.send(JSON.stringify(wsRequest));
        this.emit('request', wsRequest);
      } catch (error) {
        clearTimeout(timeoutId);
        this.callHistory.delete(reqId);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to a WebSocket stream
   * @param {Object} request Subscription request
   * @param {Function} callback Callback function
   * @param {Object} options Subscription options
   * @returns {Promise} Promise that resolves with subscription details
   */
  subscribe(request, callback, options = {}) {
    const subscribeRequest = {
      ...request,
      subscribe: 1
    };

    return this.send(subscribeRequest, {
      ...options,
      timeout: options.timeout || 20000
    }).then(response => {
      const subscription = {
        reqId: response.req_id,
        callback,
        request: subscribeRequest
      };

      this.subscriptions.set(response.subscription?.id || response.req_id, subscription);
      return subscription;
    });
  }

  /**
   * Unsubscribe from a WebSocket stream
   * @param {string|number} id Subscription ID
   * @returns {Promise} Promise that resolves when unsubscribed
   */
  unsubscribe(id) {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      return Promise.reject(new Error('Subscription not found'));
    }

    return this.send({
      [WS_MESSAGE_TYPES.Forget]: id
    }).then(() => {
      this.subscriptions.delete(id);
    });
  }

  /**
   * Unsubscribe from all WebSocket streams
   * @returns {Promise} Promise that resolves when all unsubscribed
   */
  unsubscribeAll() {
    return this.send({
      [WS_MESSAGE_TYPES.ForgetAll]: 'all'
    }).then(() => {
      this.subscriptions.clear();
    });
  }

  /**
   * Get message type from request object
   * @param {Object} request Request object
   * @returns {string} Message type
   */
  getMessageType(request) {
    // Find the first key that matches a message type
    const key = Object.keys(request).find(key => 
      Object.values(WS_MESSAGE_TYPES).includes(key)
    );
    return key || '';
  }

  /**
   * Add event listener
   * @param {string} event Event name
   * @param {Function} callback Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   * @param {string} event Event name
   * @param {Function} callback Callback function
   */
  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit event
   * @param {string} event Event name
   * @param {*} data Event data
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  /**
   * Close WebSocket connection
   * @param {number} [code=1000] Close code
   * @param {string} [reason] Close reason
   */
  close(code = WS_CLOSE_CODES.NORMAL_CLOSURE, reason) {
    this.cleanup();
    if (this.ws && this.ws.readyState !== WS_READY_STATE.CLOSED) {
      this.ws.close(code, reason);
    }
    this.ws = null;
  }
}

// Create singleton instance
const websocketService = new WebSocketManager();
export default websocketService;
