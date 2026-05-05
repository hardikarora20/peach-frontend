import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, profileApi } from '../api/client';
import { tokenStorage } from '../utils/storage';

const AuthContext = createContext(null);

function normalizeProfileResponse(data) {
  return data?.profile || data?.data || data || null;
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(tokenStorage.get());
  const [profile, setProfile] = useState(null);
  const [booting, setBooting] = useState(Boolean(tokenStorage.get()));
  const [authLoading, setAuthLoading] = useState(false);

  const logout = () => {
    tokenStorage.remove();
    setTokenState(null);
    setProfile(null);
  };

  const setToken = (nextToken) => {
    if (!nextToken) return logout();
    tokenStorage.set(nextToken);
    setTokenState(nextToken);
  };

  const refreshMe = async () => {
    if (!tokenStorage.get()) {
      setProfile(null);
      return null;
    }
    const data = await profileApi.me();
    const normalized = normalizeProfileResponse(data);
    setProfile(normalized);
    return normalized;
  };

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('peach:unauthorized', handler);
    return () => window.removeEventListener('peach:unauthorized', handler);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tokenStorage.get()) {
        if (mounted) setBooting(false);
        return;
      }
      try {
        await refreshMe();
      } catch {
        logout();
      } finally {
        if (mounted) setBooting(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await authApi.login(email, password);
      const nextToken = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
      if (!nextToken) throw new Error('Token missing in login response.');
      setToken(nextToken);
      await refreshMe().catch(() => {});
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await authApi.register(email, password);
      const nextToken = data?.token || data?.accessToken || data?.jwt || data?.data?.token;
      if (!nextToken) throw new Error('Token missing in registration response.');
      setToken(nextToken);
      await refreshMe().catch(() => {});
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(() => ({
    token,
    profile,
    booting,
    authLoading,
    setProfile,
    setToken,
    login,
    register,
    logout,
    refreshMe,
    hasProfile: Boolean(profile?.name && profile?.age && profile?.gender)
  }), [token, profile, booting, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
