import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaRegEnvelope,
  FaLock,
  FaRotateRight,
  FaArrowLeft,
  FaCircleCheck,
  FaBriefcase,
  FaUserTie,
} from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Field, InputWrap, GoogleAuthButton } from './AuthShared';

export const RegisterPage = () => {
  const { register: registerUser, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [role, setRole] = useState('candidate');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus first OTP field
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  // Step 1: Submit Details & Send OTP
  const onDetailsSubmit = async (values) => {
    try {
      const normalizedEmail = values.email.toLowerCase().trim();
      setRegisteredEmail(normalizedEmail);
      await registerUser({ ...values, email: normalizedEmail, role });
      setStep(2);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      toast.success('6-digit security code sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check your details.');
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

  // Step 2: Verify OTP
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('').trim();
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      const user = await verifyOtp({ email: registeredEmail, otp: code });
      toast.success('Account verified successfully!');
      navigate(
        user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'recruiter'
          ? '/recruiter/dashboard'
          : '/candidate/dashboard'
      );
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code. Please try again.');
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
      toast.success('New code sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleRegister = () => {
    toast('Google Sign-Up initializing...', { icon: '🔑' });
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Create an account' : 'Verify Email'}
      subtitle={
        step === 1
          ? 'Join thousands of developers & employers'
          : `Enter the 6-digit code sent to ${registeredEmail}`
      }
      isRegister={true}
    >
      {step === 1 ? (
        <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-3.5">
          
          {/* Role Selection Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#16161c] border border-slate-200 dark:border-white/10 mb-2">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'candidate'
                  ? 'bg-white dark:bg-[#22222c] text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <FaUser className="h-3 w-3" /> Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'recruiter'
                  ? 'bg-white dark:bg-[#22222c] text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <FaBriefcase className="h-3 w-3" /> Employer
            </button>
          </div>

          {/* Full Name Input Pill */}
          <Field error={errors.name?.message}>
            <InputWrap icon={FaUser}>
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#16161c] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all shadow-inner"
                placeholder="Full name"
                {...register('name', { required: 'Full name is required' })}
              />
            </InputWrap>
          </Field>

          {/* Email Address Input Pill */}
          <Field error={errors.email?.message}>
            <InputWrap icon={FaRegEnvelope}>
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#16161c] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all shadow-inner"
                placeholder="Email address"
                {...register('email', { required: 'Email address is required' })}
              />
            </InputWrap>
          </Field>

          {/* Password Input Pill */}
          <Field error={errors.password?.message}>
            <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-[#16161c] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all shadow-inner"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />
            </InputWrap>
          </Field>

          {/* Confirm Password Input Pill */}
          <Field error={errors.confirmPassword?.message}>
            <InputWrap icon={FaLock} show={showConfirmPw} toggle={() => setShowConfirmPw((s) => !s)}>
              <input
                type={showConfirmPw ? 'text' : 'password'}
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-[#16161c] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all shadow-inner"
                placeholder="Confirm password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
              />
            </InputWrap>
          </Field>

          {/* Coral/Crimson Primary Button: Continue with Email */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#f43f5e] hover:to-[#fb7185] shadow-[0_4px_22px_rgba(225,29,72,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Continue with Email'}
            </button>
          </div>

          {/* Secondary Button: Continue with Google */}
          <div className="pt-1">
            <GoogleAuthButton onClick={handleGoogleRegister} text="Continue with Google" />
          </div>

          {/* Switch Link: Already have an account? Sign In */}
          <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-5 font-medium">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-[#f43f5e] font-bold hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </form>
      ) : (
        /* ── Step 2: 6-Digit OTP Security Code Entry ── */
        <form onSubmit={onVerifyOtp} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3 my-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl bg-slate-50 dark:bg-[#16161c] border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all shadow-inner"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              {countdown > 0 ? (
                <span>Resend in <strong className="text-rose-500">{countdown}s</strong></span>
              ) : (
                <span>Code expired</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="text-rose-500 hover:text-rose-400 font-bold hover:underline disabled:opacity-40 disabled:hover:no-underline cursor-pointer flex items-center gap-1"
            >
              <FaRotateRight className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} /> Resend Code
            </button>
          </div>

          <button
            type="submit"
            disabled={verifying || otp.join('').length !== 6}
            className="w-full py-3.5 px-6 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#f43f5e] hover:to-[#fb7185] shadow-[0_4px_22px_rgba(225,29,72,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {verifying ? 'Verifying Code...' : 'Complete Verification'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <FaArrowLeft className="h-3 w-3" /> Back to Edit Details
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
