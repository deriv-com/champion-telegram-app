import { useState, useEffect, useCallback, useMemo } from 'react';
import websocketService from '@/services/websocket.service';

export const useWebSocket = (options = {}) => {
  const { debug = false } = options;
  const ws = websocketService.instance;

  const [isConnected, setIsConnected] = useState(ws.isConnected());
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
    ws.on('connected', handleConnect);
    ws.on('disconnected', handleDisconnect);
    ws.on('error', handleError);
    ws.on('message', handleMessage);

    // Cleanup subscriptions
    return () => {
      ws.off('connected', handleConnect);
      ws.off('disconnected', handleDisconnect);
      ws.off('error', handleError);
      ws.off('message', handleMessage);
    };
  }, [log, ws]);

  // Expose WebSocket service methods
  const send = useCallback((request, options = {}) => {
    return ws.send(request, options);
  }, [ws]);

  const subscribe = useCallback((request, callback, options = {}) => {
    return ws.subscribe(request, callback, options);
  }, [ws]);

  const unsubscribe = useCallback((id) => {
    return ws.unsubscribe(id);
  }, [ws]);

  const unsubscribeAll = useCallback(() => {
    return ws.unsubscribeAll();
  }, [ws]);

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
