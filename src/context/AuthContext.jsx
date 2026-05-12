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

  const login = useCallback(
    async (email, password) => {
      setAuthLoading(true);

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

        return data;
      } finally {
        setAuthLoading(false);
      }
    },
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
    };
  }, [refreshProfileExists]);

  useEffect(() => {
    const handleStorage = () => {
      setToken(readToken());
      setUserId(readUserId());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      userId,
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
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
