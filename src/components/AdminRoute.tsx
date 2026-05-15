import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageLoadingOverlay from './PageLoadingOverlay';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, profileLoading } = useAuth();

  console.log('[AdminRoute] Render - Loading:', loading, 'ProfileLoading:', profileLoading, 'User:', user?.email, 'IsAdmin:', isAdmin);

  if (loading || profileLoading) {
    console.log('[AdminRoute] Still loading auth/profile, showing overlay');
    return <PageLoadingOverlay isVisible={true} />;
  }

  // Development: allow specific dev admin email (updated to match the actual account email)
  const isDevAdmin = import.meta.env.PROD === false && user?.email === 'chinuanyaatugwu@gmai.com';
  const hasDev = import.meta.env.DEV;

  console.log('[AdminRoute] Auth loaded. User:', user?.email, 'IsAdmin:', isAdmin, 'IsDevAdmin:', isDevAdmin, 'DEV mode:', hasDev);

  if (!user) {
    console.log('[AdminRoute] No user, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAdmin && !isDevAdmin) {
    console.log('[AdminRoute] User is not admin and not dev admin, redirecting to dashboard. IsAdmin:', isAdmin, 'IsDevAdmin:', isDevAdmin);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[AdminRoute] Access granted, rendering children');
  return <>{children}</>;
};

export default AdminRoute;
