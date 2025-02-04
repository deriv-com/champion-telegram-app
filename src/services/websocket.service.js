import { APP_CONFIG } from '@/config/app.config';
import ApiManager from './api/api-manager';
import {
  WS_ERROR_MESSAGES,
  WS_ERROR_CODES,
  WS_READY_STATE,
  WS_CLOSE_CODES,
  WS_MESSAGE_TYPES
} from '@/constants/websocket.constants';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reqId = 1;
    this.callHistory = new Map();
    this.subscriptions = new Map();
    this._connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = APP_CONFIG.api.websocket.maxReconnectAttempts;
    this.reconnectTimeout = APP_CONFIG.api.websocket.reconnectTimeout;
    this.connectionTimeout = 10000;
    this.heartbeatInterval = null;
    this.eventListeners = new Map();
    this.currentToken = null;
    this.apiManager = new ApiManager(this);
  }

  get api() {
    return this.apiManager;
  }

  handleError(error) {
    const errorMessage = error.message || 'Unknown WebSocket error';
    console.error('WebSocket error:', errorMessage);
    this.emit('error', { message: errorMessage });
    
    if (this.ws?.readyState === WS_READY_STATE.OPEN) {
      this.close(3000, errorMessage);
    }
    this.cleanup();
  }

  getWebSocketUrl() {
    const { url, appId, brand, lang } = APP_CONFIG.api.websocket;
    return `${url}?app_id=${appId}&brand=${brand}&lang=${lang}`;
  }

  connect() {
    if (this.ws?.readyState === WS_READY_STATE.OPEN && this.heartbeatInterval) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WS_READY_STATE.OPEN) {
        resolve();
        return;
      }

      if (this.ws?.readyState === WS_READY_STATE.CONNECTING) {
        const checkConnection = () => {
          if (this.ws?.readyState === WS_READY_STATE.OPEN) {
            resolve();
          } else if (this.ws?.readyState === WS_READY_STATE.CLOSED) {
            this.ws = null;
            this.connect().then(resolve).catch(reject);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      try {
        this.ws = new WebSocket(this.getWebSocketUrl());
      } catch (error) {
        console.error('WebSocket connection error:', error.message || 'Failed to create connection');
        reject(new Error(error.message || 'Failed to create connection'));
        return;
      }

      const connectionTimeoutId = setTimeout(() => {
        if (this.ws?.readyState !== WS_READY_STATE.OPEN) {
          if (this.ws?.readyState !== WS_READY_STATE.CLOSED) {
            this.cleanup();
            this.ws = null;
          }
          reject(new Error('Connection timeout'));
        }
      }, this.connectionTimeout);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeoutId);
        this._connected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
        resolve();
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeoutId);
        this.handleDisconnect(event);
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeoutId);
        console.error('WebSocket connection error:', error.message || 'Connection failed');
        this.cleanup();
        this.ws = null;
        reject(new Error(error.message || 'Connection failed'));
      };

      this.ws.onmessage = this.handleMessage.bind(this);
    });
  }

  handleMessage(event) {
    let response;
    try {
      response = JSON.parse(event.data);
    } catch (error) {
      console.error('Failed to parse message:', error.message);
      return;
    }

    if (response.ping || response.pong) {
      this.emit('heartbeat', response);
      return;
    }

    this.emit('message', response);

    if (response.error) {
      this.handleErrorResponse(response);
      return;
    }

    const call = this.callHistory.get(response.req_id);
    if (!call) {
      this.handleSubscriptionUpdate(response);
      return;
    }

    if (call.timeout) {
      clearTimeout(call.timeout);
    }

    if (call.request.subscribe === 1) {
      this.handleSubscriptionResponse(response, call);
    } else {
      this.handleCallResponse(response, call);
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WS_READY_STATE.OPEN) {
        this.send({ 
          [WS_MESSAGE_TYPES.Ping]: 1,
          req_id: Math.floor(Math.random() * 1000000) + 1
        }).catch(() => {});
      }
    }, APP_CONFIG.api.websocket.heartbeatInterval);
  }

  isConnected() {
    return this.ws?.readyState === WS_READY_STATE.OPEN && this._connected;
  }

  handleDisconnect(event) {
    const wasConnected = this._connected;
    this._connected = false;
    this.cleanup();

    const reason = event.reason || WS_ERROR_MESSAGES[event.code] || 'Unknown reason';
    this.emit('disconnected', { code: event.code, reason, wasClean: event.wasClean });

    if (wasConnected && !event.wasClean) {
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket reconnection failed: Max attempts reached');
      this.emit('error', { message: 'Max reconnection attempts reached' });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
    this.emit('reconnecting', { attempt: this.reconnectAttempts, maxAttempts: this.maxReconnectAttempts, delay });

    setTimeout(() => {
      this.connect().catch(() => {});
    }, delay);
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.callHistory.forEach(({ reject, timeout }) => {
      if (timeout) clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.callHistory.clear();
    this.subscriptions.clear();
    this.currentToken = null;
  }

  handleErrorResponse(response) {
    const errorMessage = response.error.message || WS_ERROR_MESSAGES[response.error.code] || 'Unknown API error';
    const errorCode = response.error.code;
    console.error(`WebSocket API error (${errorCode}): ${errorMessage}`);

    this.emit('error', { message: errorMessage, code: errorCode });

    const call = this.callHistory.get(response.req_id);
    if (call) {
      call.reject(new Error(errorMessage));
      this.callHistory.delete(response.req_id);
    }
  }

  close(code = WS_CLOSE_CODES.NORMAL_CLOSURE, reason) {
    this.cleanup();
    if (this.ws && this.ws.readyState !== WS_READY_STATE.CLOSED) {
      this.ws.close(code, reason);
    }
    this.ws = null;
  }

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

  handleSubscriptionResponse(response, call) {
    this.subscriptions.set(response.subscription?.id || response.req_id, {
      request: call.request,
      callback: call.resolve
    });
    call.resolve(response);
    this.callHistory.delete(response.req_id);
  }

  handleCallResponse(response, call) {
    call.resolve(response);
    this.callHistory.delete(response.req_id);
  }

  async send(request, options = {}) {
    if (!this.isConnected()) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const timeout = options.timeout || 10000;
      const reqId = request.req_id || Math.floor(Math.random() * 1000000) + 1;
      const wsRequest = {
        ...request,
        req_id: reqId,
        passthrough: options.passthrough || {}
      };

      const timeoutId = setTimeout(() => {
        this.callHistory.delete(reqId);
        reject(new Error('Request timeout'));
      }, timeout);

      this.callHistory.set(reqId, {
        request: wsRequest,
        resolve,
        reject,
        timeout: timeoutId
      });

      try {
        if (this.ws?.readyState === WS_READY_STATE.OPEN) {
          const formattedRequest = typeof wsRequest === 'string' ? JSON.parse(wsRequest) : wsRequest;
          if (formattedRequest.active_symbols !== undefined) {
            formattedRequest.active_symbols = String(formattedRequest.active_symbols);
          }
          this.ws.send(JSON.stringify(formattedRequest));
          this.emit('request', formattedRequest);
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

  subscribe(request, callback, options = {}) {
    const subscribeRequest = { ...request, subscribe: 1 };
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

  unsubscribeAll() {
    return this.send({
      [WS_MESSAGE_TYPES.ForgetAll]: 'all'
    }).then(() => {
      this.subscriptions.clear();
    });
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

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

let instance = null;

export const getWebSocketService = () => {
  if (!instance) {
    instance = new WebSocketManager();
  }
  return instance;
};

export default {
  get instance() {
    return getWebSocketService();
  }
};
