import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { useAuth } from '@/hooks';
import { Loading } from '@/shared/components';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, initialize } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        await initialize();
        if (mounted) {
          setAuthChecked(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          setAuthChecked(true);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [initialize]);

  // Show loading state until auth check is complete
  if (isLoading || !authChecked) {
    return <Loading size="lg" text="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Protected route: Not authenticated, redirecting to login');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Render protected content
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
