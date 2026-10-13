import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingState } from '../components/feedback/LoadingState';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'PENDING') {
    return <Navigate to="/registration-pending" replace />;
  }

  if (user.status === 'INACTIVE' || user.status === 'REJECTED') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
