import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaUserTie,
  FaShieldHalved,
  FaRotateRight,
  FaArrowLeft,
  FaCircleCheck,
} from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Field, InputWrap } from './AuthShared';

const RegisterPage = () => {
  const { register: registerUser, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = details, 2 = OTP verification
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('candidate');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [successRedirect, setSuccessRedirect] = useState(false);

  const inputRefs = useRef([]);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  // Resend OTP countdown timer
  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus first OTP box when entering step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  // Step 1 Submit: Send OTP to verify email before account creation
  const onDetailsSubmit = async (values) => {
    try {
      const normalizedEmail = values.email.toLowerCase().trim();
      setRegisteredEmail(normalizedEmail);
      await registerUser({ ...values, email: normalizedEmail, role });
      setStep(2);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      toast.success('Verification code sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code. Please check your details.');
    }
  };

  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 1) {
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

  // Step 2 Submit: Verify OTP, create account and open dashboard
  const onOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('').trim();
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit verification code.');
      return;
    }

    setVerifying(true);
    try {
      const formValues = getValues();
      const user = await verifyOtp({
        email: registeredEmail,
        otp: code,
        name: formValues.name,
        password: formValues.password,
        role,
      });

      setSuccessRedirect(true);
      toast.success('Account created successfully! Welcome to JobHive.');

      setTimeout(() => {
        const dest = role === 'recruiter' || user?.role === 'recruiter'
          ? '/recruiter/company'
          : '/candidate/dashboard';
        navigate(dest, { replace: true });
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await resendOtp({ email: registeredEmail });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  if (step === 2) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle="Enter the 6-digit verification code sent to your inbox"
      >
        {successRedirect ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center animate-fade-in">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <FaCircleCheck className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-ink">Account Created!</h3>
            <p className="text-sm text-muted">Opening your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={onOtpSubmit} className="space-y-6">
            {/* Email info bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FaEnvelope className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs text-muted font-medium">Verification code sent to</p>
                  <p className="text-sm font-semibold text-ink truncate">{registeredEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-primary hover:underline shrink-0 ml-2"
              >
                Change
              </button>
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

            {/* Verify & Create Account Button */}
            <button
              type="submit"
              disabled={verifying || otp.join('').length !== 6}
              className="btn-primary w-full !py-3.5 text-base font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? 'Creating Account & Verifying...' : 'Verify & Create Account'}
            </button>

            {/* Resend OTP */}
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

            {/* Security Notice */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
              <FaShieldHalved className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>The OTP code is valid for 10 minutes. Please check your spam folder if not found.</span>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"
              >
                <FaArrowLeft className="h-3 w-3" /> Back to registration details
              </button>
            </div>
          </form>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join JobHive and find your dream job">
      <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              role === 'candidate' ? 'bg-white shadow-sm text-primary-700' : 'text-muted'
            }`}
          >
            <FaUserTie className="h-4 w-4" /> Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              role === 'recruiter' ? 'bg-white shadow-sm text-primary-700' : 'text-muted'
            }`}
          >
            <FaBuilding className="h-4 w-4" /> Recruiter
          </button>
        </div>

        <Field error={errors.name?.message}>
          <label className="label">Full name</label>
          <InputWrap icon={FaUser}>
            <input
              className="input !pl-10"
              placeholder="Jane Doe"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Min 2 characters' },
              })}
            />
          </InputWrap>
        </Field>

        <Field error={errors.email?.message}>
          <label className="label">Email</label>
          <InputWrap icon={FaEnvelope}>
            <input
              type="email"
              className="input !pl-10"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />
          </InputWrap>
        </Field>

        <Field error={errors.password?.message}>
          <label className="label">Password</label>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input
              type={showPw ? 'text' : 'password'}
              className="input !pl-10 !pr-10"
              placeholder="Min 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
          </InputWrap>
        </Field>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
          {isSubmitting ? 'Sending verification code...' : `Continue as ${role === 'candidate' ? 'Candidate' : 'Recruiter'}`}
        </button>
      </form>
      <p className="text-center text-sm text-muted mt-6">
        Already have an account? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
