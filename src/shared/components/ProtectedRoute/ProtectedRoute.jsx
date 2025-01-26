import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { ROUTES } from '@/config/routes.config';

const ProtectedRoute = ({ children }) => {
  const { webApp } = useTelegram();
  const isAuthenticated = Boolean(webApp?.initDataUnsafe?.user);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
