<<<<<<< HEAD
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const AuthContext = createContext(null);

function readToken() {
  return localStorage.getItem("peach_token") || "";
}

function readUserId() {
  return localStorage.getItem("peach_user_id") || "";
}

function parseExistsResponse(data) {
  if (typeof data === "boolean") return data;
  return Boolean(data?.exists ?? data?.data ?? false);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken());
  const [userId, setUserId] = useState(readUserId());

  const [booting, setBooting] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const [profileExists, setProfileExists] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("peach_token");
    localStorage.removeItem("peach_user_id");

    setToken("");
    setUserId("");
    setProfileExists(false);

    window.dispatchEvent(new Event("storage"));
  }, []);

  const persistAuth = useCallback((nextToken, nextUserId) => {
    localStorage.setItem("peach_token", nextToken);

    if (nextUserId) {
      localStorage.setItem("peach_user_id", nextUserId);
    }

    setToken(nextToken);
    setUserId(nextUserId || "");

    window.dispatchEvent(new Event("storage"));
  }, []);

  const authenticatedFetch = useCallback(
    async (url, options = {}, overrideToken = null) => {
      const authToken = overrideToken || token;

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(authToken
            ? {
                Authorization: `Bearer ${authToken}`,
              }
            : {}),
        },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Session expired");
      }

      return response;
    },
    [token, logout]
  );

  const refreshProfileExists = useCallback(
    async (overrideToken = null) => {
      const authToken = overrideToken || token;

      if (!authToken) {
        setProfileExists(false);
        return false;
      }

      try {
        const response = await authenticatedFetch(
          `${API_BASE}/profile/me/exists`,
          {},
          authToken
        );

        if (!response.ok) {
          setProfileExists(false);
          return false;
        }

        const data = await response.json().catch(() => ({}));

        const exists = parseExistsResponse(data);

        setProfileExists(exists);

        return exists;
      } catch (err) {
        console.error(err);
        setProfileExists(false);
        return false;
      }
    },
    [token, authenticatedFetch]
  );
=======
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
>>>>>>> 8a08bf3 (updated ui)

  const login = useCallback(
    async (email, password) => {
      setAuthLoading(true);
<<<<<<< HEAD

      try {
        const response = await fetch(`${API_BASE}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Login failed");
        }

        if (!data?.token) {
          throw new Error("Missing auth token");
        }

        persistAuth(data.token, data.userId);

        await refreshProfileExists(data.token);

=======
      try {
        const data = await authApi.login(email, password);
        if (!data?.token) throw new Error(data?.message || "The server didn't return a login token.");
        setProfileExists(null);
        persist(data.token, data.userId);
        await refreshProfileExists();
>>>>>>> 8a08bf3 (updated ui)
        return data;
      } finally {
        setAuthLoading(false);
      }
    },
<<<<<<< HEAD
    [persistAuth, refreshProfileExists]
  );

  const register = useCallback(
    async (email, password) => {
      setAuthLoading(true);

      try {
        const response = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Registration failed");
        }

        if (data?.token) {
          persistAuth(data.token, data.userId);

          await refreshProfileExists(data.token);
        } else {
          setProfileExists(false);
        }

=======
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
>>>>>>> 8a08bf3 (updated ui)
        return data;
      } finally {
        setAuthLoading(false);
      }
    },
<<<<<<< HEAD
    [persistAuth, refreshProfileExists]
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const storedToken = readToken();
        const storedUserId = readUserId();

        if (!mounted) return;

        setToken(storedToken);
        setUserId(storedUserId);

        if (storedToken) {
          await refreshProfileExists(storedToken);
        } else {
          setProfileExists(false);
        }
      } finally {
        if (mounted) {
          setBooting(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
=======
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
>>>>>>> 8a08bf3 (updated ui)
    };
  }, [refreshProfileExists]);

  useEffect(() => {
<<<<<<< HEAD
    const handleStorage = () => {
      setToken(readToken());
      setUserId(readUserId());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
=======
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
>>>>>>> 8a08bf3 (updated ui)
  }, []);

  const value = useMemo(
    () => ({
      token,
      userId,
<<<<<<< HEAD
      booting,
      authLoading,

      profileExists,
      hasProfile: profileExists === true,

      login,
      register,
      logout,

      authenticatedFetch,
      refreshProfileExists,

      setProfileExists,

      isAuthenticated: Boolean(token),
    }),
    [
      token,
      userId,
      booting,
      authLoading,
      profileExists,
      login,
      register,
      logout,
      authenticatedFetch,
      refreshProfileExists,
    ]
=======
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
>>>>>>> 8a08bf3 (updated ui)
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
<<<<<<< HEAD
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
=======
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
>>>>>>> 8a08bf3 (updated ui)
}
