import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { RootLayout, ProtectedRoute } from '@/shared';
import { LandingPage, Dashboard } from '@/features/home';
import { LoginForm } from '@/features/auth/components/LoginForm';

function App() {
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
