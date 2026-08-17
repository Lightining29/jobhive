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
      const currentUser = data?.user || null;
      setUser(currentUser);
      if (currentUser?.role === 'candidate') {
        try {
          const saved = await candidateService.saved();
          setSavedJobs(saved?.data?.jobs || []);
        } catch {
          setSavedJobs([]);
        }
      }
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const u = await refreshUser();
        if (u && isMounted) {
          try {
            const { data } = await import('../services').then((m) => m.notificationService.list());
            if (isMounted) setUnreadCount(data?.unreadCount || 0);
          } catch {
            // ignore notification fetch errors
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    const loggedUser = data?.user || null;
    setUser(loggedUser);
    if (loggedUser?.role === 'candidate') {
      try {
        const saved = await candidateService.saved();
        setSavedJobs(saved?.data?.jobs || []);
      } catch {
        setSavedJobs([]);
      }
    }
    toast.success('Welcome back!');
    return loggedUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }, []);

  const verifyOtp = useCallback(async (payload) => {
    const { data } = await authService.verifyOtp(payload);
    setUser(data.user);
    toast.success(data.message || 'Email verified successfully!');
    return data.user;
  }, []);

  const resendOtp = useCallback(async (payload) => {
    const { data } = await authService.resendOtp(payload);
    toast.success(data.message || 'Verification code resent!');
    return data;
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
      register,
      verifyOtp,
      resendOtp,
      logout,
      refreshUser,
      savedJobs,
      toggleSaved,
      unreadCount,
      setUnreadCount,
    }),
    [user, loading, login, register, verifyOtp, resendOtp, logout, refreshUser, savedJobs, toggleSaved, unreadCount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
