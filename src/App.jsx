import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
<<<<<<< HEAD
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
import OnboardingPage from "./pages/OnboardingPage";

function App() {
=======
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import HomeRedirect from "./pages/HomeRedirect";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import FeedPage from "./pages/FeedPage";
import MatchesPage from "./pages/MatchesPage";
import ConversationsPage from "./pages/ConversationsPage";
import ChatPage from "./pages/ChatPage";
import MyProfilePage from "./pages/MyProfilePage";
import ViewProfilePage from "./pages/ViewProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import NotFound from "./pages/NotFound";

export default function App() {
>>>>>>> 8a08bf3 (updated ui)
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
<<<<<<< HEAD
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
          path="/app/onboarding"
          element={
            <AppShell>
              <OnboardingPage />
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
=======
        <Route path="/app/onboarding" element={<OnboardingPage />} />
        <Route element={<AppShell />}>
          <Route path="/app" element={<Navigate to="/app/feed" replace />} />
          <Route path="/app/feed" element={<FeedPage />} />
          <Route path="/app/matches" element={<MatchesPage />} />
          <Route path="/app/conversations" element={<ConversationsPage />} />
          <Route path="/app/chat/:matchId" element={<ChatPage />} />
          <Route path="/app/profile" element={<MyProfilePage />} />
          <Route path="/app/profile/:profileId" element={<ViewProfilePage />} />
          <Route path="/app/editprofile" element={<EditProfilePage />} />
        </Route>
>>>>>>> 8a08bf3 (updated ui)
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
<<<<<<< HEAD

export default App;
=======
>>>>>>> 8a08bf3 (updated ui)
