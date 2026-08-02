/**
 * GoogleLoginButton.jsx
 *
 * Uses Google OAuth 2.0 implicit/token flow via a popup window.
 * Works in Brave, Firefox, Chrome, Safari — avoids the FedCM
 * (accounts.google.com/gsi/transform) blank page issue.
 *
 * Flow:
 *  1. Open Google OAuth popup
 *  2. User selects account
 *  3. Google redirects to /auth/google/callback (a blank page in public/)
 *  4. That page postMessages the credential back to the opener
 *  5. We send it to POST /api/auth/google
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '798271672760-m61an45o2h033erd10gdrut2msne5ms7.apps.googleusercontent.com';

// Build the Google OAuth URL
function buildGoogleOAuthUrl() {
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  redirectUri,
    response_type: 'token',
    scope:         'openid email profile',
    prompt:        'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

const GoogleLoginButton = ({ role = 'candidate' }) => {
  const { googleLogin } = useAuth();
  const navigate        = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useCallback(() => {
    const oauthUrl = buildGoogleOAuthUrl();

    // Open the OAuth consent screen in a popup
    const width  = 500;
    const height = 600;
    const left   = Math.round(window.screenX + (window.outerWidth  - width)  / 2);
    const top    = Math.round(window.screenY + (window.outerHeight - height) / 2);
    const popup  = window.open(
      oauthUrl,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no`
    );

    if (!popup) {
      toast.error('Popup blocked. Please allow popups for this site and try again.');
      return;
    }

    setLoading(true);

    // Poll for the popup to redirect to our callback page
    const timer = setInterval(async () => {
      try {
        // When popup lands on our domain, read the hash fragment
        if (popup.closed) {
          clearInterval(timer);
          setLoading(false);
          return;
        }

        const popupUrl = popup.location.href;
        if (!popupUrl.includes(window.location.origin)) return; // still on Google

        clearInterval(timer);

        // Extract access_token from hash
        const hash   = popup.location.hash || popup.location.search;
        const params = new URLSearchParams(hash.replace('#', ''));
        const token  = params.get('access_token');
        popup.close();

        if (!token) {
          toast.error('Google sign-in cancelled.');
          setLoading(false);
          return;
        }

        // Exchange access token for user info
        const infoRes  = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const info = await infoRes.json();

        if (!info.sub) throw new Error('Failed to get user info from Google');

        // Create a synthetic credential payload the backend understands
        // We'll use userinfo directly rather than an id_token
        const user = await googleLogin({ credential: token, role, userInfo: info });
        toast.success(`Welcome, ${info.given_name || info.name}!`);
        navigate(
          user.role === 'admin'     ? '/admin/dashboard'
          : user.role === 'recruiter' ? '/recruiter/dashboard'
          : '/candidate/dashboard'
        );
      } catch (err) {
        // Ignore cross-origin access errors while popup is on Google
        if (err.name === 'SecurityError' || err.name === 'DOMException') return;
        clearInterval(timer);
        popup.close();
        toast.error(err.message || 'Google sign-in failed. Please try again.');
        setLoading(false);
      }
    }, 300);

    // Timeout after 3 minutes
    setTimeout(() => {
      clearInterval(timer);
      if (!popup.closed) popup.close();
      setLoading(false);
    }, 3 * 60 * 1000);
  }, [googleLogin, navigate, role]);

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-line rounded-lg bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleLoginButton;
