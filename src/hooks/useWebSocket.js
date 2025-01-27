import { useEffect, useCallback, useRef } from 'react';
import { websocketService } from '@/services/websocket.service';

export const useWebSocket = (channels = [], handlers = {}) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const setupListeners = useCallback(() => {
    // Setup message handlers
    const messageHandler = ({ type, payload }) => {
      if (handlersRef.current[type]) {
        handlersRef.current[type](payload);
      }
    };

    websocketService.on('message', messageHandler);

    // Setup connection status handlers
    const connectedHandler = () => {
      // Resubscribe to channels on reconnection
      channels.forEach(channel => websocketService.subscribe(channel));
    };

    websocketService.on('connected', connectedHandler);

    // Cleanup function
    return () => {
      websocketService.off('message', messageHandler);
      websocketService.off('connected', connectedHandler);
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
  };
};
