import { APP_CONFIG } from '@/config/app.config';
import { AuthApi } from './api/auth-api';
import { MarketApi } from './api/market-api';
import { TradingApi } from './api/trading-api';
import { AccountApi } from './api/account-api';
import {
  WS_ERROR_MESSAGES,
  WS_ERROR_CODES,
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
   * Handle WebSocket errors
   * @param {Error} error Error object
   */
  handleError(error) {
    const errorMessage = error.message || 'Unknown WebSocket error';
    console.error('WebSocket error:', errorMessage);
    
    // Emit error event with simplified error
    this.emit('error', { message: errorMessage });
    
    // Close connection if it's still open
    if (this.ws?.readyState === WS_READY_STATE.OPEN) {
      this.close(3000, errorMessage);
    }
    
    // Clear any pending operations
    this.cleanup();
  }

  /**
   * Get WebSocket URL based on environment
   * @returns {string} WebSocket URL with query parameters
   */
  getWebSocketUrl() {
    const { url, appId, brand, lang } = APP_CONFIG.api.websocket;
    return `${url}?app_id=${appId}&brand=${brand}&lang=${lang}`;
  }

  /**
   * Connect to WebSocket server
   * @returns {Promise<void>} Resolves when connected
   */
  connect() {
    return new Promise((resolve, reject) => {
      // If already connected, resolve immediately
      if (this.ws?.readyState === WS_READY_STATE.OPEN) {
        resolve();
        return;
      }

      // If connection is in progress, wait for it to complete or fail
      if (this.ws?.readyState === WS_READY_STATE.CONNECTING) {
        console.log('Connection already in progress, waiting...');
        const checkConnection = () => {
          if (this.ws?.readyState === WS_READY_STATE.OPEN) {
            resolve();
          } else if (this.ws?.readyState === WS_READY_STATE.CLOSED) {
            // Previous connection attempt failed, try again
            this.ws = null;
            this.connect().then(resolve).catch(reject);
          } else {
            // Still connecting, check again in 100ms
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      const url = this.getWebSocketUrl();
      
      try {
        this.ws = new WebSocket(url);
      } catch (error) {
        const errorMessage = error.message || 'Failed to create WebSocket connection';
        console.error('WebSocket connection error:', errorMessage);
        reject(new Error(errorMessage));
        return;
      }

      // Set up connection timeout
      const connectionTimeoutId = setTimeout(() => {
        if (this.ws?.readyState !== WS_READY_STATE.OPEN) {
          const error = new Error('Connection timeout');
          // Only cleanup if not already closed
          if (this.ws?.readyState !== WS_READY_STATE.CLOSED) {
            this.cleanup();
            this.ws = null;
          }
          reject(error);
        }
      }, this.connectionTimeout);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeoutId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        console.log('WebSocket connection established successfully');
        this.emit('connected');
        resolve();
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeoutId);
        this.handleDisconnect(event);
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeoutId);
        const errorMessage = error.message || 'Failed to establish WebSocket connection';
        console.error('WebSocket connection error:', errorMessage);
        
        // Cleanup without trying to close the socket
        this.cleanup();
        this.ws = null;
        
        reject(new Error(errorMessage));
      };

      this.ws.onmessage = this.handleMessage.bind(this);
    });
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
      console.error('Failed to parse message:', error.message);
      return;
    }

    // Handle ping/pong
    if (response.ping || response.pong) {
      this.emit('heartbeat', response);
      return;
    }

    // Emit raw message for debugging
    this.emit('message', response);

    // Log message type from response
    if (response.msg_type) {
      console.log(`WebSocket message type: ${response.msg_type}`);
    }

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
          console.error('Heartbeat failed:', error.message || 'Unknown error');
        });
      }
    }, APP_CONFIG.api.websocket.heartbeatInterval);
  }

  /**
   * Handle WebSocket disconnection
   * @param {CloseEvent} event Close event
   */
  /**
   * Check if WebSocket is currently connected
   * @returns {boolean} True if connected
   */
  isConnected() {
    return this.ws?.readyState === WS_READY_STATE.OPEN && this.isConnected;
  }

  handleDisconnect(event) {
    const wasConnected = this.isConnected;
    this.isConnected = false;
    this.cleanup();

    // Get reason from event or error code mapping
    const reason = event.reason || WS_ERROR_MESSAGES[event.code] || 'Unknown reason';

    // Emit disconnect event with details
    this.emit('disconnected', {
      code: event.code,
      reason,
      wasClean: event.wasClean
    });

    // Log disconnect with reason
    console.log(`WebSocket disconnected (${event.code}): ${reason}`);

    // Attempt reconnection unless it was a clean close or auth error
    if (wasConnected && 
        !event.wasClean && 
        event.code !== WS_CLOSE_CODES.NORMAL_CLOSURE &&
        event.code !== 3000) { // Don't reconnect on auth errors (code 3000)
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket reconnection failed: Max attempts reached');
      this.emit('error', { message: 'Max reconnection attempts reached' });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay
    });

    setTimeout(async () => {
      try {
        await this.connect();
        console.log('WebSocket reconnection successful');
      } catch (error) {
        console.error('WebSocket reconnection failed:', error.message || 'Unknown error');
      }
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
   * Handle error responses
   * @param {Object} response Error response
   */
  handleErrorResponse(response) {
    // Get error message from response or error code mapping
    const errorMessage = response.error.message || WS_ERROR_MESSAGES[response.error.code] || 'Unknown API error';
    const errorCode = response.error.code;

    // Log error with message type if available
    const msgType = response.msg_type ? ` [${response.msg_type}]` : '';
    console.error(`WebSocket API error${msgType} (${errorCode}): ${errorMessage}`);

    // Create simplified error object
    const error = {
      message: errorMessage,
      code: errorCode
    };

    // Handle authorization errors specially
    if (errorCode === WS_ERROR_CODES.AuthorizationRequired || 
        errorCode === WS_ERROR_CODES.InvalidToken) {
      // Close connection on auth errors to force reconnect
      this.close(3000, errorMessage);
      // Clear any pending operations
      this.cleanup();
      // Reset connection state
      this.isConnected = false;
      // Attempt reconnect
      this.attemptReconnect();
    }

    // Emit error event with simplified error
    this.emit('error', error);

    // Reject corresponding call if exists
    const call = this.callHistory.get(response.req_id);
    if (call) {
      call.reject(new Error(errorMessage));
      this.callHistory.delete(response.req_id);
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
        console.error('Subscription callback error:', error.message || 'Unknown error');
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
  async send(request, options = {}) {
    // If not connected, try to connect first
    if (!this.isConnected) {
      try {
        await this.connect();
      } catch (error) {
        throw new Error(`Failed to establish WebSocket connection: ${error.message}`);
      }
    }

    return new Promise((resolve, reject) => {
      const reqId = this.reqId++;
      const timeout = options.timeout || 10000;
      
      // Prepare the request object
      const wsRequest = {
        req_id: reqId,
        ...request,
        passthrough: options.passthrough || {}
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
        if (this.ws?.readyState === WS_READY_STATE.OPEN) {
          this.ws.send(JSON.stringify(wsRequest));
          this.emit('request', wsRequest);
        } else {
          clearTimeout(timeoutId);
          this.callHistory.delete(reqId);
          reject(new Error('WebSocket connection lost'));
        }
      } catch (error) {
        clearTimeout(timeoutId);
        this.callHistory.delete(reqId);
        reject(new Error(error.message || 'Failed to send request'));
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
          console.error('Event listener error:', error.message || 'Unknown error');
        }
      });
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketManager();
export default websocketService;
