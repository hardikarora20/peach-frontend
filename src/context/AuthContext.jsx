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

function safeBooleanFromProfileExistsResponse(data) {
  if (typeof data === "boolean") return data;
  return Boolean(data?.exists ?? data?.data ?? false);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken());
  const [userId, setUserId] = useState(readUserId());
  const [authLoading, setAuthLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [profileExists, setProfileExists] = useState(null);

  const persistAuth = useCallback((nextToken, nextUserId) => {
    if (nextToken) {
      localStorage.setItem("peach_token", nextToken);
      setToken(nextToken);
    }

    if (nextUserId) {
      localStorage.setItem("peach_user_id", nextUserId);
      setUserId(nextUserId);
    }

    window.dispatchEvent(new Event("storage"));
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("peach_token");
    localStorage.removeItem("peach_user_id");
    setToken("");
    setUserId("");
    setProfileExists(null);
    window.dispatchEvent(new Event("storage"));
  }, []);

  const refreshProfileExists = useCallback(
    async (overrideToken = token) => {
      if (!overrideToken) {
        setProfileExists(false);
        return false;
      }

      try {
        const res = await fetch(`${API_BASE}/profile/me/exists`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${overrideToken}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          setProfileExists(false);
          return false;
        }

        const data = await res.json().catch(() => ({}));
        const exists = safeBooleanFromProfileExistsResponse(data);

        setProfileExists(exists);
        return exists;
      } catch (err) {
        console.error("refreshProfileExists failed:", err);
        setProfileExists(false);
        return false;
      }
    },
    [token]
  );

  const login = useCallback(
    async (email, password) => {
      setAuthLoading(true);
      try {
        const res = await fetch(`${API_BASE}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || data?.error || "Login failed");
        }

        const nextToken = data?.token;
        const nextUserId = data?.userId;

        if (!nextToken) {
          throw new Error("Missing auth token");
        }

        persistAuth(nextToken, nextUserId);
        await refreshProfileExists(nextToken);

        return data;
      } finally {
        setAuthLoading(false);
      }
    },
    [persistAuth, refreshProfileExists]
  );

  const register = useCallback(
    async (email, password) => {
      setAuthLoading(true);
      try {
        const res = await fetch(`${API_BASE}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || "Registration failed"
          );
        }

        const nextToken = data?.token;
        const nextUserId = data?.userId;

        if (nextToken) {
          persistAuth(nextToken, nextUserId);
          await refreshProfileExists(nextToken);
        } else {
          if (nextUserId) {
            localStorage.setItem("peach_user_id", nextUserId);
            setUserId(nextUserId);
          }
          setProfileExists(false);
        }

        return data;
      } finally {
        setAuthLoading(false);
      }
    },
    [persistAuth, refreshProfileExists]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const currentToken = readToken();
      const currentUserId = readUserId();

      if (!cancelled) {
        setToken(currentToken);
        setUserId(currentUserId);
      }

      if (currentToken) {
        await refreshProfileExists(currentToken);
      } else {
        setProfileExists(false);
      }

      if (!cancelled) {
        setBooting(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [refreshProfileExists]);

  useEffect(() => {
    const onStorage = () => {
      const nextToken = readToken();
      const nextUserId = readUserId();

      setToken(nextToken);
      setUserId(nextUserId);

      if (!nextToken) {
        setProfileExists(false);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      token,
      userId,
      booting,
      authLoading,
      profileExists,
      hasProfile: profileExists === true,
      setProfileExists,
      login,
      register,
      logout: clearAuth,
      refreshProfileExists,
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
      clearAuth,
      refreshProfileExists,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
