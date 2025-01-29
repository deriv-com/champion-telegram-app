import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { RootLayout, ProtectedRoute, Loading } from '@/shared';
import { LandingPage, Dashboard } from '@/features/home';
import LoginPage from '@/features/auth/components/LoginPage';
import { useAuth } from '@/hooks';
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initialize } = useAuth();

  useEffect(() => {
    // Only handle OAuth callback redirect
    if (window.location.search && window.location.pathname === '/') {
      navigate(ROUTES.LOGIN + window.location.search, { replace: true });
    }
    
    // Initialize auth state
    initialize();
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
