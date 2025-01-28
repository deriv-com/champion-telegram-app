import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { RootLayout, ProtectedRoute } from '@/shared';
import { LandingPage, Dashboard } from '@/features/home';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { authService } from '@/services/auth.service';
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      // Initialize authentication state
      const isAuthenticated = await authService.initialize();
      
      // Redirect based on auth state
      if (isAuthenticated) {
        navigate(ROUTES.DASHBOARD);
      } else {
        // Clear any stale session data and redirect to landing
        await authService.clearSession();
        navigate(ROUTES.HOME);
      }
    };

    initAuth();
  }, [navigate]);

  return (
    <RootLayout>
      <Routes>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginForm />} />
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
