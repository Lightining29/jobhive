/**
 * GoogleLoginButton.jsx
 *
 * Uses Google Identity Services (GSI) — the standard approach.
 * Removed use_fedcm_for_prompt which caused blank screens in Brave.
 * The renderButton approach works across all browsers including Brave.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GoogleLoginButton = ({ role = 'candidate', text = 'continue_with' }) => {
  const { googleLogin } = useAuth();
  const navigate        = useNavigate();
  const btnRef          = useRef(null);
  const [ready, setReady]   = useState(false);
  const [loading, setLoading] = useState(false);

  // Load the GSI script once
  useEffect(() => {
    if (window.google?.accounts?.id) { setReady(true); return; }
    if (document.getElementById('google-gsi-script')) {
      const check = setInterval(() => {
        if (window.google?.accounts?.id) { setReady(true); clearInterval(check); }
      }, 100);
      return () => clearInterval(check);
    }
    const script    = document.createElement('script');
    script.id       = 'google-gsi-script';
    script.src      = 'https://accounts.google.com/gsi/client';
    script.async    = true;
    script.defer    = true;
    script.onload   = () => setReady(true);
    script.onerror  = () => toast.error('Could not load Google Sign-In. Check your connection.');
    document.head.appendChild(script);
  }, []);

  const handleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      toast.error('Google sign-in cancelled.');
      return;
    }
    setLoading(true);
    try {
      const user = await googleLogin({ credential: response.credential, role });
      toast.success('Welcome!');
      navigate(
        user.role === 'admin'       ? '/admin/dashboard'
        : user.role === 'recruiter' ? '/recruiter/dashboard'
        : '/candidate/dashboard'
      );
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate, role]);

  // Initialise + render the button whenever ready or handleCredential changes
  useEffect(() => {
    if (!ready || !window.google?.accounts?.id || !btnRef.current) return;

    window.google.accounts.id.initialize({
      client_id:   GOOGLE_CLIENT_ID,
      callback:    handleCredential,
      auto_select: false,
      // NO use_fedcm_for_prompt — it causes blank screens in Brave
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      type:  'standard',
      theme: 'outline',
      size:  'large',
      width: btnRef.current.offsetWidth || 360,
      text,
      shape: 'rectangular',
      logo_alignment: 'left',
    });
  }, [ready, handleCredential, text]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {loading && (
        <p className="text-sm text-muted flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-muted border-t-transparent animate-spin" />
          Signing in with Google…
        </p>
      )}
      {/* GSI renders its button into this div */}
      <div ref={btnRef} className="w-full" style={{ minHeight: 44 }} />
    </div>
  );
};

export default GoogleLoginButton;
