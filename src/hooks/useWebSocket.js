import { useState, useEffect, useCallback, useMemo } from 'react';
import websocketService from '@/services/websocket.service';

export const useWebSocket = (options = {}) => {
  const { debug = false } = options;

  const [isConnected, setIsConnected] = useState(websocketService.isConnected);
  const [messageHistory, setMessageHistory] = useState([]);
  const [error, setError] = useState(null);

  // Memoized logger
  const log = useMemo(() => {
    return (...args) => {
      if (debug) {
        console.log('[WebSocket]', ...args);
      }
    };
  }, [debug]);

  // Subscribe to WebSocket events
  useEffect(() => {
    const handleConnect = () => {
      log('Connected');
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = (event) => {
      log('Disconnected:', event);
      setIsConnected(false);
    };

    const handleError = (error) => {
      log('Error:', error);
      setError(error);
    };

    const handleMessage = (message) => {
      log('Message received:', message);
      setMessageHistory(prev => [...prev, message]);
    };

    // Subscribe to WebSocket events
    websocketService.on('connected', handleConnect);
    websocketService.on('disconnected', handleDisconnect);
    websocketService.on('error', handleError);
    websocketService.on('message', handleMessage);

    // Cleanup subscriptions
    return () => {
      websocketService.off('connected', handleConnect);
      websocketService.off('disconnected', handleDisconnect);
      websocketService.off('error', handleError);
      websocketService.off('message', handleMessage);
    };
  }, [log]);

  // Expose WebSocket service methods
  const send = useCallback((request, options = {}) => {
    return websocketService.send(request, options);
  }, []);

  const subscribe = useCallback((request, callback, options = {}) => {
    return websocketService.subscribe(request, callback, options);
  }, []);

  const unsubscribe = useCallback((id) => {
    return websocketService.unsubscribe(id);
  }, []);

  const unsubscribeAll = useCallback(() => {
    return websocketService.unsubscribeAll();
  }, []);

  // Memoize return values
  return useMemo(() => ({
    isConnected,
    messageHistory,
    error,
    send,
    subscribe,
    unsubscribe,
    unsubscribeAll
  }), [isConnected, messageHistory, error, send, subscribe, unsubscribe, unsubscribeAll]);
};
