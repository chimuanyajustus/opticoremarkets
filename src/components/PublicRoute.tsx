import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageLoadingOverlay from './PageLoadingOverlay';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <PageLoadingOverlay isVisible={true} />;
  }

  if (user) {
    // Redirect authenticated admin users to admin dashboard
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }

    // In production, redirect unverified users to verification page
    if (import.meta.env.PROD && user.emailVerified === false) {
      return <Navigate to="/verify-email" replace />;
    }

    // Redirect authenticated regular users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

