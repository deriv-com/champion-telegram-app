import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { RootLayout, ProtectedRoute, Loading } from '@/shared';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LandingPage, Dashboard } from '@/features/home';
import LoginPage from '@/features/auth/components/LoginPage';
import { TradePage } from '@/features/trade';
import { CashierPage } from '@/features/cashier';
import { PositionsPage } from '@/features/positions';
import { useAuth } from '@/hooks';
import { useEffect, useState } from 'react';
import websocketService from '@/services/websocket.service';
import { authService } from '@/services/auth.service';
import { initializeTelegramWebApp } from '@/hooks/useTelegram';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initialize } = useAuth();
  const [isWebAppInitialized, setIsWebAppInitialized] = useState(false);

  /**
   * Initialize Telegram WebApp and set up cleanup
   * Handles initialization of Telegram-specific features and ensures proper cleanup
   * of event listeners when component unmounts
   */
  useEffect(() => {
    let cleanupTelegram;
    try {
      cleanupTelegram = initializeTelegramWebApp();
      setIsWebAppInitialized(true);
    } catch (error) {
      // Log specific error for debugging but continue app initialization
      console.error('Failed to initialize Telegram WebApp:', error.message || error);
      setIsWebAppInitialized(true); // Continue anyway to allow app to work in browser
    }

    // Cleanup function to remove event listeners on unmount
    return () => cleanupTelegram?.();
  }, []);

  useEffect(() => {
    const handleInitialization = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Initialize auth state first
        const initResult = await initialize();
        console.log('Auth initialization result:', initResult);

        const ws = websocketService.instance;
        
        // Only establish WebSocket connection if auth is successful and not already connected
        if (initResult && !ws.isConnected()) {
          try {
            console.log('Establishing WebSocket connection...');
            await ws.connect();
            console.log('WebSocket connected successfully');
          } catch (error) {
            console.error('WebSocket connection failed:', error);
            // If WebSocket fails due to auth, clear session
            if (error.code === 'AuthorizationRequired' || error.code === 'InvalidToken') {
              console.error('WebSocket authorization failed, clearing session');
              await authService.clearSession();
              return;
            }
            console.warn('Some features may be limited due to WebSocket connection failure');
          }
        }
        
        // Handle navigation after successful initialization
        const currentPath = window.location.pathname;
        const hasSearchParams = window.location.search.length > 0;
        
        // OAuth callback handling
        if (hasSearchParams && currentPath === '/') {
          console.log('Redirecting OAuth callback to login page...');
          navigate(ROUTES.LOGIN + window.location.search, { replace: true });
          return;
        }
        
        // Skip navigation if on login page
        if (currentPath === ROUTES.LOGIN) {
          return;
        }
        
        // Redirect authenticated users to dashboard if at root
        if (initResult && currentPath === '/') {
          console.log('Authenticated user at root, redirecting to dashboard...');
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };
    
    handleInitialization();
  }, [navigate, initialize]);

  return (
    <ThemeProvider>
      <RootLayout>
        {/* Show loading state during initial load or WebApp initialization */}
        {((isLoading && !isAuthenticated) || !isWebAppInitialized) ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
          }}>
            <Loading size="lg" text="Initializing..." />
          </div>
        ) : (
          <Routes>
        <Route 
          path={ROUTES.HOME} 
          element={
            isAuthenticated ? (
              <Navigate to={ROUTES.DASHBOARD} replace />
            ) : (
              <LandingPage />
            )
          } 
        />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route 
          path={ROUTES.DASHBOARD} 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        )}
      </RootLayout>
    </ThemeProvider>
  );
}

export default App;
