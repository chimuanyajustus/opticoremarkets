import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // In development, allow admin access for the configured admin email
  // Remove this condition in production and rely only on Firestore role
  const isDevAdmin = import.meta.env.PROD === false && user?.email === 'chimuanyaatugwu@gmail.com';

  if (!user || (!isAdmin && !isDevAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;