import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshSession = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.verifySession();
      setAdmin(data.admin);
      return data.admin;
    } catch (requestError) {
      setAdmin(null);
      if (requestError.status !== 401) setError(requestError.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      setAdmin(data.admin);
      return data.admin;
    } catch (requestError) {
      setAdmin(null);
      setError(requestError.status === 401
        ? 'Invalid email or password.'
        : requestError.status === 503
          ? 'Authentication service is unavailable.'
          : requestError.message || 'Unable to sign in.');
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Clear local auth state even if the server session endpoint is unavailable.
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, error, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}