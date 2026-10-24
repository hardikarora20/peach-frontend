import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, getErrorMessage, profileApi, UNAUTHORIZED_EVENT } from "../api/client";
import { session } from "../utils/storage";
import { hasEssentials } from "../utils/essentials";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(session.getToken());
  const [userId, setUserId] = useState(session.getUserId());
  const [booting, setBooting] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(null); // null = not known yet
  const [profileError, setProfileError] = useState(""); // set when the check itself failed
  const [me, setMe] = useState(null); // own profile, used by the sidebar

  const logout = useCallback(() => {
    session.clear();
    setToken("");
    setUserId("");
    setMe(null);
    setProfileExists(false);
    setProfileError("");
  }, []);

  const persist = useCallback((nextToken, nextUserId) => {
    session.save(nextToken, nextUserId);
    setToken(nextToken);
    setUserId(nextUserId ? String(nextUserId) : "");
  }, []);

  // Onboarding is only for missing essentials (name, age 18+, gender, city, bio).
  // A failed request is shown as "try again", never as "no profile".
  const refreshProfileExists = useCallback(async () => {
    if (!session.getToken()) {
      setProfileExists(false);
      return false;
    }
    setProfileError("");
    try {
      const profile = await profileApi.me();
      setMe(profile);
      const ok = hasEssentials(profile);
      setProfileExists(ok);
      return ok;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) return false;
      setProfileExists(null);
      setProfileError(getErrorMessage(err, "Couldn't check your profile."));
      return null;
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      setAuthLoading(true);
      try {
        const data = await authApi.login(email, password);
        if (!data?.token) throw new Error(data?.message || "The server didn't return a login token.");
        setProfileExists(null);
        persist(data.token, data.userId);
        await refreshProfileExists();
        return data;
      } finally {
        setAuthLoading(false);
      }
    },
    [persist, refreshProfileExists]
  );

  // POST /users doesn't return a token, so sign in straight after
  const register = useCallback(
    async (email, password) => {
      setAuthLoading(true);
      try {
        await authApi.register(email, password);
        const data = await authApi.login(email, password);
        if (!data?.token) throw new Error("Account created, but signing in failed. Please sign in.");
        persist(data.token, data.userId);
        setProfileExists(false);
        return data;
      } finally {
        setAuthLoading(false);
      }
    },
    [persist]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      if (session.getToken()) await refreshProfileExists();
      else setProfileExists(false);
      if (alive) setBooting(false);
    })();
    return () => {
      alive = false;
    };
  }, [refreshProfileExists]);

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  useEffect(() => {
    const onStorage = () => {
      setToken(session.getToken());
      setUserId(session.getUserId());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      token,
      userId,
      me,
      setMe,
      booting,
      authLoading,
      profileExists,
      profileError,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshProfileExists,
      setProfileExists,
    }),
    [token, userId, me, booting, authLoading, profileExists, profileError, login, register, logout, refreshProfileExists]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
