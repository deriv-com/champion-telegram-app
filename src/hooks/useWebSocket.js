import { useEffect, useCallback, useRef, useReducer } from 'react';
import { websocketService } from '@/services/websocket.service';

const initialState = {
  isConnected: false,
  isConnecting: true,
  error: null,
  reconnectAttempt: 0
};

const connectionReducer = (state, action) => {
  switch (action.type) {
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempt: 0
      };
    case 'CONNECT_START':
      return {
        ...state,
        isConnected: false,
        isConnecting: true,
        error: null
      };
    case 'CONNECT_ERROR':
      return {
        ...state,
        error: action.payload,
        isConnecting: false
      };
    case 'RECONNECT_ATTEMPT':
      return {
        ...state,
        isConnecting: true,
        reconnectAttempt: action.payload
      };
    default:
      return state;
  }
};

export const useWebSocket = (channels = [], handlers = {}) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  
  const [connectionState, dispatch] = useReducer(connectionReducer, initialState);

  const setupListeners = useCallback(() => {
    // Setup message handlers
    const messageHandler = ({ type, payload }) => {
      if (handlersRef.current[type]) {
        handlersRef.current[type](payload);
      }
    };

    const connectedHandler = () => {
      dispatch({ type: 'CONNECT_SUCCESS' });
      // Resubscribe to channels on reconnection
      channels.forEach(channel => websocketService.subscribe(channel));
    };

    const disconnectedHandler = () => {
      dispatch({ type: 'CONNECT_START' });
    };

    const errorHandler = (error) => {
      dispatch({ type: 'CONNECT_ERROR', payload: error });
    };

    const reconnectHandler = (attempt) => {
      dispatch({ type: 'RECONNECT_ATTEMPT', payload: attempt });
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
