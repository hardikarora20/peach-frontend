import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import Profile from "./pages/Profile";
import FeedPage from "./pages/FeedPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import HomeRedirect from "./pages/HomeRedirect";
import NotFound from "./pages/NotFound";
import EditProfilePage from "./pages/EditProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/app"
          element={
            <AppShell>
              <Navigate to="/app/feed" replace />
            </AppShell>
          }
        />
        <Route
          path="/app/profile"
          element={
            <AppShell>
              <EditProfilePage />
            </AppShell>
          }
        />
        <Route
          path="/app/profile2"
          element={
            <AppShell>
              <Profile />
            </AppShell>
          }
        />
        <Route
          path="/app/feed"
          element={
            <AppShell>
              <FeedPage />
            </AppShell>
          }
        />
        <Route
          path="/app/matches"
          element={
            <AppShell>
              <MatchesPage />
            </AppShell>
          }
        />
        <Route
          path="/app/chat/:matchId"
          element={
            <AppShell>
              <ChatPage />
            </AppShell>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
