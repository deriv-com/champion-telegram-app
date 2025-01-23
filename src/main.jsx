import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeTelegramWebApp } from '@/utils/telegram';
import './styles/telegram.css';
import './styles/global.css';

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
