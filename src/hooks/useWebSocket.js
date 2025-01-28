import { useEffect, useCallback, useRef, useState } from 'react';
import { websocketService } from '@/services/websocket.service';

export const useWebSocket = (channels = [], handlers = {}) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isConnecting: true,
    error: null,
    reconnectAttempt: 0
  });

  const setupListeners = useCallback(() => {
    // Setup message handlers
    const messageHandler = ({ type, payload }) => {
      if (handlersRef.current[type]) {
        handlersRef.current[type](payload);
      }
    };

    const connectedHandler = () => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempt: 0
      }));
      // Resubscribe to channels on reconnection
      channels.forEach(channel => websocketService.subscribe(channel));
    };

    const disconnectedHandler = () => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: true,
        error: null
      }));
    };

    const errorHandler = (error) => {
      setConnectionState(prev => ({
        ...prev,
        error,
        isConnecting: false
      }));
    };

    const reconnectHandler = (attempt) => {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        reconnectAttempt: attempt
      }));
    };

    websocketService.on('message', messageHandler);
    websocketService.on('connected', connectedHandler);
    websocketService.on('disconnected', disconnectedHandler);
    websocketService.on('error', errorHandler);
    websocketService.on('reconnect_attempt', reconnectHandler);

    // Cleanup function
    return () => {
      websocketService.off('message', messageHandler);
      websocketService.off('connected', connectedHandler);
      websocketService.off('disconnected', disconnectedHandler);
      websocketService.off('error', errorHandler);
      websocketService.off('reconnect_attempt', reconnectHandler);
      channels.forEach(channel => websocketService.unsubscribe(channel));
    };
  }, [channels]);

  useEffect(() => {
    // Connect to WebSocket if not already connected
    websocketService.connect();

    // Setup event listeners
    const cleanup = setupListeners();

    // Subscribe to initial channels
    channels.forEach(channel => websocketService.subscribe(channel));

    return () => {
      cleanup();
    };
  }, [channels, setupListeners]);

  const send = useCallback((type, payload) => {
    websocketService.send(type, payload);
  }, []);

  return {
    send,
    subscribe: websocketService.subscribe.bind(websocketService),
    unsubscribe: websocketService.unsubscribe.bind(websocketService),
    connectionState
  };
};
