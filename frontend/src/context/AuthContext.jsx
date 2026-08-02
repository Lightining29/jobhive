import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { authService, candidateService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.me();
      setUser(data.user);
      if (data.user?.role === 'candidate') {
        const saved = await candidateService.saved();
        setSavedJobs(saved.data.jobs || []);
      }
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const u = await refreshUser();
        if (u) {
          const { data } = await import('../services').then((m) => m.notificationService.list());
          setUnreadCount(data.unreadCount || 0);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    setUser(data.user);
    toast.success('Welcome back!');
    return data.user;
  }, []);

  const googleLogin = useCallback(async (payload) => {
    const { data } = await authService.googleLogin(payload);
    setUser(data.user);
    toast.success('Welcome!');
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    setUser(data.user);
    toast.success('Account created!');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setSavedJobs([]);
    setUnreadCount(0);
    toast.success('Logged out');
  }, []);

  const toggleSaved = useCallback(
    async (jobId) => {
      const { data } = await candidateService.toggleSaved(jobId);
      setSavedJobs((prev) =>
        data.saved ? [...prev, { _id: jobId }] : prev.filter((j) => j._id !== jobId)
      );
      toast.success(data.saved ? 'Job saved' : 'Removed from saved');
      return data.saved;
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      googleLogin,
      register,
      logout,
      refreshUser,
      savedJobs,
      toggleSaved,
      unreadCount,
      setUnreadCount,
    }),
    [user, loading, login, googleLogin, register, logout, refreshUser, savedJobs, toggleSaved, unreadCount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
