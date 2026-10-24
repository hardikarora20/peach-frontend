import React, { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CloudOff, LogOut, RefreshCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, EmptyState, Loader } from "./ui";

export default function ProtectedRoute() {
  const { token, booting, profileExists, profileError, refreshProfileExists, logout } = useAuth();
  const location = useLocation();
  const [retrying, setRetrying] = useState(false);

  if (booting) {
    return (
      <div className="page-center">
        <Loader label="Opening Peach" />
      </div>
    );
  }

  if (!token) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  if (profileError) {
    return (
      <div className="page-center">
        <EmptyState
          icon={<CloudOff size={26} />}
          title="Couldn't reach Peach"
          description={profileError}
          action={
            <div className="row-gap">
              <Button variant="ghost" icon={<LogOut size={18} />} onClick={logout}>
                Log out
              </Button>
              <Button
                icon={<RefreshCcw size={18} />}
                loading={retrying}
                onClick={async () => {
                  setRetrying(true);
                  await refreshProfileExists();
                  setRetrying(false);
                }}
              >
                Try again
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (profileExists === null) {
    return (
      <div className="page-center">
        <Loader label="Checking your profile" />
      </div>
    );
  }

  // Onboarding only when an essential is missing (utils/essentials.js)
  const onOnboarding = location.pathname === "/app/onboarding";
  if (!profileExists && !onOnboarding) return <Navigate to="/app/onboarding" replace />;
  if (profileExists && onOnboarding) return <Navigate to="/app/feed" replace />;

  return <Outlet />;
}
