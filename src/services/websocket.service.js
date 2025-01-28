import { EventEmitter } from 'events';

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000; // Start with 1s timeout
  }

  connect(url = import.meta.env.VITE_WS_URL) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
      this.emit('connected');

      // Send authentication if token exists
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.send('auth', { token });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, payload } = data;

        // Emit the event with its payload
        this.emit(type, payload);

        // Also emit a general message event
        this.emit('message', { type, payload });
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

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

  send(type, payload = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  subscribe(channel) {
    this.send('subscribe', { channel });
  }

  unsubscribe(channel) {
    this.send('unsubscribe', { channel });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();
