<<<<<<< HEAD
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomeRedirect() {
  const { token, hasProfile, booting } = useAuth();

  if (booting) return null;
  if (!token) return <Navigate to="/auth" replace />;
  return <Navigate to={hasProfile ? '/app/feed' : '/app/profile'} replace />;
=======
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "../components/ui";

export default function HomeRedirect() {
  const { token, booting } = useAuth();
  if (booting) {
    return (
      <div className="page-center">
        <Loader label="Opening Peach" />
      </div>
    );
  }
  return <Navigate to={token ? "/app/feed" : "/auth"} replace />;
>>>>>>> 8a08bf3 (updated ui)
}
