import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

export const useWebSocket = (url = APP_CONFIG.api.websocket.url, options = {}) => {
  const { 
    reconnectOnAccountChange = true,
    autoReconnectAttempts = APP_CONFIG.api.websocket.maxReconnectAttempts,
    heartbeatInterval: customHeartbeatInterval = APP_CONFIG.api.websocket.heartbeatInterval,
    debug = false
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [error, setError] = useState(null);

  const { defaultAccount } = useAuth();
  
  // Refs for WebSocket instance and state
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(APP_CONFIG.api.websocket.reconnectTimeout);
  const messageQueue = useRef([]);
  const lastMessageId = useRef(0);
  const pendingResponses = useRef(new Map());
  const heartbeatInterval = useRef(null);
  const connectionTimeout = useRef(null);
  const eventListeners = useRef(new Map());
  const isReconnecting = useRef(false);
  const mounted = useRef(true);

  // Memoized logger
  const log = useMemo(() => {
    return (...args) => {
      if (debug) {
        console.log('[WebSocket]', ...args);
      }
    };
  }, [debug]);

  // Enhanced cleanup function
  const cleanup = useCallback(() => {
    log('Cleaning up WebSocket resources');
    isReconnecting.current = false;

    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }

    // Clear pending responses and their timeouts
    pendingResponses.current.forEach(({ timeout }) => clearTimeout(timeout));
    pendingResponses.current.clear();

    // Clear message queue
    messageQueue.current = [];

    // Clear event listeners
    eventListeners.current.clear();

    // Reset error state
    if (mounted.current) {
      setError(null);
    }
  }, [log]);

  // Enhanced connect function
  const connect = useCallback(() => {
    if (isReconnecting.current || !mounted.current) {
      return;
    }

    // Enforce WSS in production
    if (APP_CONFIG.environment.isProduction && !url.startsWith('wss://')) {
      const error = new Error('Secure WebSocket connection (WSS) required in production');
      log('Connection error:', error);
      setError(error);
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    cleanup();

    // Set connection timeout
    connectionTimeout.current = setTimeout(() => {
      if (ws.current?.readyState !== WebSocket.OPEN) {
        const error = new Error('WebSocket connection timeout');
        log('Connection timeout:', error);
        setError(error);
        ws.current?.close();
        attemptReconnect();
      }
    }, APP_CONFIG.api.websocket.connectionTimeout);

    try {
      ws.current = new WebSocket(url);
      ws.current.onopen = handleOpen;
      ws.current.onmessage = handleMessage;
      ws.current.onclose = handleClose;
      ws.current.onerror = handleError;
      log('Connecting to:', url);
    } catch (error) {
      log('Failed to create WebSocket:', error);
      setError(error);
      attemptReconnect();
    }
  }, [url, cleanup, log, attemptReconnect, handleOpen, handleMessage, handleClose, handleError]);

  const handleOpen = useCallback(() => {
    log('Connected');
    if (!mounted.current) return;

    setIsConnected(true);
    setError(null);
    reconnectAttempts.current = 0;
    reconnectTimeout.current = APP_CONFIG.api.websocket.reconnectTimeout;
    isReconnecting.current = false;

    // Clear connection timeout
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }

    // Authenticate connection
    authenticate();

    // Start heartbeat
    startHeartbeat();

    // Process any queued messages
    processMessageQueue();
  }, [log, authenticate, startHeartbeat, processMessageQueue]);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Validate message structure
      if (!validateMessage(data)) {
        log('Invalid message format:', data);
        return;
      }

      const { type, payload, id } = data;

      // Handle heartbeat response
      if (type === 'pong') {
        return;
      }

      // Handle response to a specific message
      if (id && pendingResponses.current.has(id)) {
        const { resolve, timeout } = pendingResponses.current.get(id);
        clearTimeout(timeout);
        pendingResponses.current.delete(id);
        resolve(payload);
        return;
      }

      // Emit to subscribers
      const listeners = eventListeners.current.get(type) || [];
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          log('Listener error:', error);
        }
      });

      // Update message history if mounted
      if (mounted.current) {
        setMessageHistory(prev => [...prev, data]);
      }
    } catch (error) {
      log('Message parse error:', error);
      setError(error);
    }
  }, [log, validateMessage]);

  const handleClose = useCallback((event) => {
    log('Disconnected:', event.code, event.reason);
    if (!mounted.current) return;

    setIsConnected(false);
    cleanup();
    attemptReconnect();
  }, [cleanup, log, attemptReconnect]);

  const handleError = useCallback((error) => {
    log('Error:', error);
    if (!mounted.current) return;
    
    setError(error);
    
    // Close and cleanup socket on error
    if (ws.current) {
      cleanup();
      ws.current.close();
      ws.current = null;
    }
    
    // Attempt reconnection
    attemptReconnect();
  }, [cleanup, log, attemptReconnect]);

  const authenticate = useCallback(async () => {
    try {
      const session = await authService.getStoredSession();
      if (session?.token) {
        send('auth', { token: session.token });
        log('Authenticated');
      }
    } catch (error) {
      log('Authentication error:', error);
      setError(error);
    }
  }, [log, send]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        send('ping');
      }
    }, customHeartbeatInterval);
  }, [customHeartbeatInterval, send]);

  const validateMessage = useCallback((data) => {
    if (!data || typeof data !== 'object') return false;
    if (!data.type || typeof data.type !== 'string') return false;
    if (data.id && typeof data.id !== 'number') return false;
    return true;
  }, []);

  const attemptReconnect = useCallback(() => {
    if (!mounted.current || isReconnecting.current || 
        reconnectAttempts.current >= autoReconnectAttempts) {
      if (reconnectAttempts.current >= autoReconnectAttempts) {
        log('Max reconnection attempts reached');
      }
      return;
    }

    isReconnecting.current = true;
    setTimeout(() => {
      reconnectAttempts.current++;
      log(`Reconnect attempt ${reconnectAttempts.current}/${autoReconnectAttempts}`);
      reconnectTimeout.current *= 2; // Exponential backoff
      connect();
    }, reconnectTimeout.current);
  }, [connect, autoReconnectAttempts, log]);

  const processMessageQueue = useCallback(() => {
    while (messageQueue.current.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
      const message = messageQueue.current.shift();
      try {
        ws.current.send(JSON.stringify(message));
        log('Processed queued message:', message);
      } catch (error) {
        log('Failed to process queued message:', error);
        messageQueue.current.unshift(message); // Put message back in queue
        break;
      }
    }
  }, [log]);

  const send = useCallback((type, payload = {}) => {
    try {
      // Add CSRF token if available
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const message = {
        type,
        payload,
        csrf: csrfToken,
        timestamp: Date.now()
      };
      
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
        log('Sent message:', message);
      } else {
        messageQueue.current.push(message);
        log('Message queued:', message);
      }
    } catch (error) {
      log('Send error:', error);
      setError(error);
    }
  }, [log]);

  const sendWithResponse = useCallback((type, payload = {}, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      try {
        const id = ++lastMessageId.current;
        const message = { type, payload, id };

        // Set timeout for response
        const timeoutId = setTimeout(() => {
          pendingResponses.current.delete(id);
          const error = new Error(`Message ${id} timed out`);
          log('Message timeout:', error);
          reject(error);
        }, timeout);

        // Store pending response handlers
        pendingResponses.current.set(id, { resolve, reject, timeout: timeoutId });

        // Send or queue message
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(message));
          log('Sent message with response:', message);
        } else {
          messageQueue.current.push(message);
          log('Message with response queued:', message);
        }
      } catch (error) {
        log('SendWithResponse error:', error);
        reject(error);
      }
    });
  }, [log]);

  const subscribe = useCallback((channel, callback) => {
    if (typeof channel !== 'string' || !channel.trim()) {
      const error = new Error('Invalid channel name');
      log('Subscribe error:', error);
      throw error;
    }

    const channelName = channel.trim();
    if (!eventListeners.current.has(channelName)) {
      eventListeners.current.set(channelName, new Set());
    }
    eventListeners.current.get(channelName).add(callback);
    send('subscribe', { channel: channelName });
    log('Subscribed to channel:', channelName);

    // Return unsubscribe function
    return () => {
      const listeners = eventListeners.current.get(channelName);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          eventListeners.current.delete(channelName);
          send('unsubscribe', { channel: channelName });
          log('Unsubscribed from channel:', channelName);
        }
      }
    };
  }, [send, log]);

  // Handle account changes
  useEffect(() => {
    if (reconnectOnAccountChange && defaultAccount?.account) {
      log('Account changed, reconnecting...');
      connect();
    }
  }, [defaultAccount, reconnectOnAccountChange, connect, log]);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    connect();
    
    return () => {
      mounted.current = false;
      cleanup();
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect, cleanup]);

  // Memoize return values
  const returnValue = useMemo(() => ({
    isConnected,
    messageHistory,
    error,
    send,
    sendWithResponse,
    subscribe,
    connect // Expose connect for manual reconnection if needed
  }), [isConnected, messageHistory, error, send, sendWithResponse, subscribe, connect]);

  return returnValue;
};
