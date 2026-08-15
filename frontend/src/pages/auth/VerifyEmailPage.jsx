import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCircleCheck, FaXmark, FaEnvelope, FaRotateRight, FaShieldHalved, FaArrowLeft } from 'react-icons/fa6';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthShared';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const tokenParam = params.get('token');
  const emailParam = params.get('email') || user?.email || '';
  const roleParam = params.get('role') || user?.role || 'candidate';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [tokenStatus, setTokenStatus] = useState(tokenParam ? 'verifying' : 'idle');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (!tokenParam) return;
    (async () => {
      try {
        setTokenStatus('verifying');
        const { data } = await authService.verifyEmail(tokenParam);
        setTokenStatus('success');
        setVerifiedSuccess(true);
        toast.success(data.message || 'Email verified successfully!');
        const u = await refreshUser();
        setTimeout(() => {
          navigate(u?.role === 'recruiter' ? '/recruiter/company' : '/candidate/dashboard');
        }, 1500);
      } catch (err) {
        setTokenStatus('invalid');
        toast.error(err.message || 'Invalid or expired verification link.');
      }
    })();
  }, [tokenParam, refreshUser, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (!tokenParam && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [tokenParam]);

  const handleOtpChange = (index, value) => {
    // Handle typing single digit
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 1) {
      // User pasted multiple characters into a box
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((c, idx) => {
        newOtp[idx] = c;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newOtp = [...otp];
    pasteData.split('').forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtp(newOtp);
    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('').trim();
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit verification code.');
      return;
    }
    if (!email) {
      toast.error('Email address is missing. Please enter your email.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await authService.verifyOtp({ email, otp: code });
      setVerifiedSuccess(true);
      toast.success(data?.message || 'Email verified successfully!');
      await refreshUser();
      setTimeout(() => {
        const dest = roleParam === 'recruiter' || data?.user?.role === 'recruiter'
          ? '/recruiter/company'
          : '/candidate/dashboard';
        navigate(dest);
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    if (!email) {
      toast.error('Please provide your email to resend code.');
      return;
    }
    setResending(true);
    try {
      const { data } = await authService.resendOtp({ email });
      toast.success(data?.message || 'New 6-digit OTP sent to your email.');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  // If verifying token from email link
  if (tokenParam) {
    return (
      <AuthLayout title="Email Verification">
        {tokenStatus === 'verifying' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary animate-spin" />
            <p className="text-base font-medium text-ink">Verifying your email token...</p>
            <p className="text-xs text-muted">Please wait a moment while we activate your account.</p>
          </div>
        )}
        {tokenStatus === 'success' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <FaCircleCheck className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-ink">Email Verified Successfully!</h3>
            <p className="text-sm text-muted">Your account is ready. Redirecting to your dashboard...</p>
          </div>
        )}
        {tokenStatus === 'invalid' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-2">
              <FaXmark className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-ink">Link Expired or Invalid</h3>
            <p className="text-sm text-muted">This verification link is no longer valid.</p>
            <Link to="/auth/login" className="btn-primary mt-4">
              Return to Login
            </Link>
          </div>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a 6-digit security code to your email inbox"
    >
      {verifiedSuccess ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center animate-fade-in">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
            <FaCircleCheck className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-ink">Email Verified!</h3>
          <p className="text-sm text-muted">Welcome to JobHive! Redirecting you now...</p>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          {/* Email badge / edit */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FaEnvelope className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="text-xs text-muted font-medium">Verification email sent to</p>
                <p className="text-sm font-semibold text-ink truncate">{email || 'your email'}</p>
              </div>
            </div>
            <Link
              to="/auth/register"
              className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2"
            >
              Change
            </Link>
          </div>

          {/* 6 Digit Inputs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-3 text-center">
              Enter 6-Digit Code
            </label>
            <div className="flex items-center justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-extrabold text-ink bg-white border-2 border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || otp.join('').length !== 6}
            className="btn-primary w-full !py-3.5 text-base font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Verifying Code...' : 'Verify & Continue'}
          </button>

          {/* Resend OTP Section */}
          <div className="flex items-center justify-between pt-2 border-t border-line text-sm">
            <span className="text-muted">Didn't receive the code?</span>
            {countdown > 0 ? (
              <span className="text-xs font-semibold text-muted bg-slate-100 px-3 py-1.5 rounded-full">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-primary font-bold hover:underline flex items-center gap-1.5 text-sm"
              >
                <FaRotateRight className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
            <FaShieldHalved className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>The verification code expires in 10 minutes. Please check your spam or junk folder if not found in inbox.</span>
          </div>

          <div className="text-center pt-2">
            <Link to="/auth/login" className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink">
              <FaArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
