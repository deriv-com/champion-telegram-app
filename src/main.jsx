import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeTelegramWebApp } from '@/services/telegram';
import '@/assets/styles/global.css';
import '@/assets/styles/telegram.css';
import '@/assets/styles/theme.css';

// Initialize Telegram WebApp
try {
  initializeTelegramWebApp();
} catch (error) {
  console.error('Failed to initialize Telegram WebApp:', error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
