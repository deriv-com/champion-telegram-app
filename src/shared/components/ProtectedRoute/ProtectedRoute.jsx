import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { authService } from '@/services/auth.service';
import { APP_CONFIG } from '@/config/app.config';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = APP_CONFIG.environment.isDevelopment || authService.isAuthenticated();

  if (!isAuthenticated) {
    // Clear any stale session data
    authService.clearSession();
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
