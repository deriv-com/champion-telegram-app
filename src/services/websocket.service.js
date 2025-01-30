import { EventEmitter } from 'events';
import { APP_CONFIG } from '@/config/app.config';
import { authService } from '@/services/auth.service';

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = APP_CONFIG.api.websocket.maxReconnectAttempts;
    this.reconnectTimeout = APP_CONFIG.api.websocket.reconnectTimeout;
    this.messageQueue = [];
    this.lastMessageId = 0;
    this.pendingResponses = new Map();
    this.heartbeatInterval = null;
    this.connectionTimeout = null;
    this.boundEventHandlers = new Map();
  }

  /**
   * Connect to WebSocket server with security checks
   */
  connect(url = APP_CONFIG.api.websocket.url) {
    // Enforce WSS in production
    if (APP_CONFIG.environment.isProduction && !url.startsWith('wss://')) {
      console.error('Secure WebSocket connection (WSS) required in production');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing timeouts
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }

    // Set connection timeout
    this.connectionTimeout = setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        console.error('WebSocket connection timeout');
        this.ws?.close();
        this.attemptReconnect();
      }
    }, APP_CONFIG.api.websocket.connectionTimeout);

    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    // Store bound handlers for cleanup
    this.boundEventHandlers.set('open', this.handleOpen.bind(this));
    this.boundEventHandlers.set('message', this.handleMessage.bind(this));
    this.boundEventHandlers.set('close', this.handleClose.bind(this));
    this.boundEventHandlers.set('error', this.handleError.bind(this));

    this.ws.addEventListener('open', this.boundEventHandlers.get('open'));
    this.ws.addEventListener('message', this.boundEventHandlers.get('message'));
    this.ws.addEventListener('close', this.boundEventHandlers.get('close'));
    this.ws.addEventListener('error', this.boundEventHandlers.get('error'));
  }

  handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 1000;
    this.emit('connected');

    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }

    // Authenticate connection
    this.authenticate();

    // Start heartbeat
    this.startHeartbeat();

    // Process any queued messages
    this.processMessageQueue();
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Validate message structure
      if (!this.validateMessage(data)) {
        console.error('Invalid message format:', data);
        return;
      }

      const { type, payload, id } = data;

      // Handle heartbeat response
      if (type === 'pong') {
        return;
      }

      // Handle response to a specific message
      if (id && this.pendingResponses.has(id)) {
        const { resolve, timeout } = this.pendingResponses.get(id);
        clearTimeout(timeout);
        this.pendingResponses.delete(id);
        resolve(payload);
        return;
      }

      // Emit the event with its payload
      this.emit(type, payload);

      // Also emit a general message event
      this.emit('message', { type, payload });
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  }

  handleClose(event) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.cleanup();
    this.emit('disconnected', { code: event.code, reason: event.reason });
    this.attemptReconnect();
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.emit('error', error);
    
    // Close and cleanup socket on error
    if (this.ws) {
      this.cleanup();
      this.ws.close();
      this.ws = null;
    }
    
    // Attempt reconnection
    this.attemptReconnect();
  }

  /**
   * Authenticate WebSocket connection
   */
  async authenticate() {
    const session = await authService.getStoredSession();
    if (session?.token) {
      this.send('auth', { token: session.token });
    }
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping');
      }
    }, APP_CONFIG.api.websocket.heartbeatInterval);
  }

  /**
   * Validate incoming message format
   */
  validateMessage(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.type || typeof data.type !== 'string') return false;
    if (data.id && typeof data.id !== 'number') return false;
    return true;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }
    // Clear pending responses
    this.pendingResponses.forEach(({ timeout }) => clearTimeout(timeout));
    this.pendingResponses.clear();

    // Remove event listeners
    if (this.ws) {
      this.boundEventHandlers.forEach((handler, event) => {
        this.ws.removeEventListener(event, handler);
      });
    }
    this.boundEventHandlers.clear();
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.emit('reconnect_attempt', this.reconnectAttempts);
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.reconnectTimeout *= 2; // Exponential backoff
      this.connect();
    }, this.reconnectTimeout);
  }

  /**
   * Send message with promise-based response handling
   */
  async sendWithResponse(type, payload = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const id = ++this.lastMessageId;
      const message = { type, payload, id };

      // Set timeout for response
      const timeoutId = setTimeout(() => {
        this.pendingResponses.delete(id);
        reject(new Error(`Message ${id} timed out`));
      }, timeout);

      // Store pending response handlers
      this.pendingResponses.set(id, { resolve, reject, timeout: timeoutId });

      // Send or queue message
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        this.messageQueue.push(message);
      }
    });
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send message
   */
  send(type, payload = {}) {
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const message = {
      type,
      payload,
      csrf: csrfToken,
      timestamp: Date.now()
    };
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
      console.warn('WebSocket is not connected, message queued');
    }
  }

  /**
   * Subscribe to channel with validation
   */
  subscribe(channel) {
    if (typeof channel !== 'string' || !channel.trim()) {
      console.error('Invalid channel name');
      return;
    }
    this.send('subscribe', { channel: channel.trim() });
  }

  /**
   * Unsubscribe from channel with validation
   */
  unsubscribe(channel) {
    if (typeof channel !== 'string' || !channel.trim()) {
      console.error('Invalid channel name');
      return;
    }
    this.send('unsubscribe', { channel: channel.trim() });
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();
