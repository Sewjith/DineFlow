import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { decodeExp, getToken, setToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());

  const login = useCallback(async (username, password) => {
    const result = await authApi.login(username, password);
    setToken(result.token);
    setTokenState(result.token);
    return result;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
  }, []);

  // Any request that comes back 401 (expired/invalid token) logs the admin out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Proactively log out the moment the current token expires, without waiting
  // for the next request to fail.
  useEffect(() => {
    if (!token) return undefined;
    const exp = decodeExp(token);
    if (exp == null) return undefined;
    const msLeft = exp * 1000 - Date.now();
    if (msLeft <= 0) {
      logout();
      return undefined;
    }
    const id = setTimeout(logout, msLeft);
    return () => clearTimeout(id);
  }, [token, logout]);

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), login, logout }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
