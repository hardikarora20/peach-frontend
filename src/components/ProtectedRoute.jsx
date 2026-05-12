import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "./UI";

export function ProtectedRoute() {
  const { token, booting, profileExists } = useAuth();
  const location = useLocation();

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

  if (profileExists === null) {
    return (
      <div className="page-center">
        <Loader label="Checking profile" />
      </div>
    );
  }

  console.log(token);

  if (!profileExists && location.pathname !== "/app/onboarding") {
    return <Navigate to="/app/onboarding" replace />;
  }

  if (profileExists && location.pathname === "/app/onboarding") {
    return <Navigate to="/app/feed" replace />;
  }

  return <Outlet />;
}
