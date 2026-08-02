import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '798271672760-m61an45o2h033erd10gdrut2msne5ms7.apps.googleusercontent.com';

const GoogleLoginButton = ({ role = 'candidate', text = 'continue_with' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.getElementById('google-gsi-script')) {
      setReady(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    script.onerror = () => toast.error('Failed to load Google Sign-In');
    document.head.appendChild(script);
  }, []);

  const handleCredential = useCallback(async (response) => {
    if (!response.credential) {
      toast.error('Google login failed: no credential received');
      return;
    }
    setLoading(true);
    try {
      const user = await googleLogin({ credential: response.credential, role });
      toast.success('Welcome!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate, role]);

  useEffect(() => {
    if (!ready || !window.google || !btnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
      auto_select: false,
      use_fedcm_for_prompt: true,
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: btnRef.current.offsetWidth || 300,
      text,
      shape: 'rectangular',
    });
  }, [ready, handleCredential, text]);

  return (
    <div className="flex justify-center">
      {loading && <p className="text-sm text-muted">Signing in with Google...</p>}
      <div ref={btnRef} className="w-full" />
    </div>
  );
};

export default GoogleLoginButton;
