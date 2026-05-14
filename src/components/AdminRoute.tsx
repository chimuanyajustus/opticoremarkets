import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageLoadingOverlay from './PageLoadingOverlay';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return <PageLoadingOverlay isVisible={true} />;
  }

  // Development: allow specific dev admin email
  const isDevAdmin = import.meta.env.PROD === false && user?.email === 'chimuanyaatugwu@gmail.com';

  if (!user || (!isAdmin && !isDevAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
