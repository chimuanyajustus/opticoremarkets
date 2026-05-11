import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }

    // In development, skip email verification check to allow testing
    // In production, uncomment the verification check below
    if (import.meta.env.PROD && user.emailVerified === false) {
      return <Navigate to="/verify-email" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
