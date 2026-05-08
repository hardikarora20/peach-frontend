import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import ViewUserPage from "./pages/ViewUserPage";
import Profile from "./pages/Profile";
import FeedPage from "./pages/FeedPage";
import Conversations from "./pages/Conversations";
import ChatPage from "./pages/ChatPage";
import HomeRedirect from "./pages/HomeRedirect";
import NotFound from "./pages/NotFound";
import EditProfilePage from "./pages/EditProfilePage";
import MatchesPage from "./pages/MatchesPage";

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
          path="/app/editprofile"
          element={
            <AppShell>
              <EditProfilePage />
            </AppShell>
          }
        />
        <Route
          path="/app/profile"
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
          path="/app/conversations"
          element={
            <AppShell>
              <Conversations />
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
        <Route
          path="/app/profile/:userId"
          element={
            <AppShell>
              <ViewUserPage />
            </AppShell>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
