import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './UI';

export function ProtectedRoute() {
  const { token, booting } = useAuth();

  if (booting) {
    return (
      <div className="page-center">
        <Loader label="Restoring session" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
