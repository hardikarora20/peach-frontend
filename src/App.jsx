import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
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
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
