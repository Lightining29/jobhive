import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const GoogleCallbackPage = () => {
  const { googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate(
        user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'recruiter'
          ? '/recruiter/dashboard'
          : '/candidate/dashboard',
        { replace: true }
      );
      return;
    }

    const processAuth = async () => {
      // 1. Check URL hash (e.g. #id_token=... or #credential=...)
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
      // 2. Check URL search params (e.g. ?credential=... or ?id_token=...)
      const searchParams = new URLSearchParams(location.search);

      const credential =
        hashParams.get('id_token') ||
        hashParams.get('credential') ||
        searchParams.get('id_token') ||
        searchParams.get('credential');

      const error = hashParams.get('error') || searchParams.get('error');

      if (error) {
        toast.error('Google authorization failed: ' + error);
        navigate('/auth/login', { replace: true });
        return;
      }

      if (credential) {
        try {
          const loggedUser = await googleLogin({ credential });
          toast.success('Welcome!');
          navigate(
            loggedUser.role === 'admin'
              ? '/admin/dashboard'
              : loggedUser.role === 'recruiter'
              ? '/recruiter/dashboard'
              : '/candidate/dashboard',
            { replace: true }
          );
        } catch (err) {
          toast.error(err.message || 'Google login failed');
          navigate('/auth/login', { replace: true });
        }
      } else {
        // If no credentials in callback, return to login
        navigate('/auth/login', { replace: true });
      }
    };

    processAuth();
  }, [location, user, googleLogin, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <h2 className="text-lg font-semibold text-ink">Completing Google Sign-in…</h2>
      <p className="text-sm text-muted">Please wait while we log you into Job Workplace.</p>
    </div>
  );
};

export default GoogleCallbackPage;
