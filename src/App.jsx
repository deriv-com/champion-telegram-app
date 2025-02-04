import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { RootLayout, ProtectedRoute, Loading } from '@/shared';
import { LandingPage, Dashboard } from '@/features/home';
import LoginPage from '@/features/auth/components/LoginPage';
import { TradePage } from '@/features/trade';
import { CashierPage } from '@/features/cashier';
import { PositionsPage } from '@/features/positions';
import { useAuth } from '@/hooks';
import { useEffect } from 'react';
import websocketService from '@/services/websocket.service';
import { authService } from '@/services/auth.service';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initialize } = useAuth();

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

  // Show loading state only during initial load
  if (isLoading && !isAuthenticated) {
    return (
      <RootLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Loading size="lg" text="Initializing..." />
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
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
    </RootLayout>
  );
}

export default App;
