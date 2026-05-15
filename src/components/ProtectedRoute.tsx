import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageLoadingOverlay from './PageLoadingOverlay';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Render - Loading:', loading, 'User:', user?.email);

  if (loading) {
    console.log('[ProtectedRoute] Still loading auth, showing overlay');
    return <PageLoadingOverlay isVisible={true} />;
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // In production, check email verification
  if (import.meta.env.PROD && !user.emailVerified) {
    console.log('[ProtectedRoute] Email not verified, redirecting to verify-email');
    return <Navigate to="/verify-email" replace />;
  }

  console.log('[ProtectedRoute] Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;

