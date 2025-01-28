import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';
import { authService } from '@/services/auth.service';
import { APP_CONFIG } from '@/config/app.config';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated && !APP_CONFIG.environment.isDevelopment) {
    // Clear any stale session data and redirect to login
    authService.clearSession();
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
