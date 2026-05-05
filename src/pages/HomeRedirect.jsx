import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomeRedirect() {
  const { token, hasProfile, booting } = useAuth();

  if (booting) return null;
  if (!token) return <Navigate to="/auth" replace />;
  return <Navigate to={hasProfile ? '/app/feed' : '/app/profile'} replace />;
}
