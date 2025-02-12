import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initializeTelegramWebApp } from '@/hooks/useTelegram';
import '@/assets/styles/global.css';
import '@/assets/styles/telegram.css';

// Initialize Telegram WebApp
try {
  initializeTelegramWebApp();
} catch (error) {
  console.error('Failed to initialize Telegram WebApp:', error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
