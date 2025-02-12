import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initializeTelegramWebApp } from '@/hooks/useTelegram';
import '@/assets/styles/global.css';
import '@/assets/styles/telegram.css';

// Initialize Telegram WebApp
try {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      document.body.style.height = window.visualViewport.height + 'px';
    });
  }
  // This will ensure user never overscroll the page
  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) window.scrollTo(0, 0);
  });
  
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
