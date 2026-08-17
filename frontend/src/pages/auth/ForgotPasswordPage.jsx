import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCircleCheck, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Field, InputWrap } from './AuthShared';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP + New Password
  const [userEmail, setUserEmail] = useState('');
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Step 1: Request OTP / Reset Link
  const handleRequestReset = async ({ email }) => {
    try {
      const normalized = email.trim().toLowerCase();
      const { data } = await authService.forgotPassword(normalized);
      toast.success(data.message || 'Reset code sent to your email!');
      setUserEmail(normalized);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset instructions.');
    }
  };

  // Step 2: Submit OTP + New Password
  const handleResetWithOtp = async ({ otp, password }) => {
    try {
      const { data } = await authService.resetPassword({
        email: userEmail,
        otp: otp.trim(),
        password,
      });
      toast.success(data.message || 'Password reset successfully!');
      if (data.user) {
        setUser(data.user);
        navigate(data.user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
      } else {
        navigate('/auth/login');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired reset code.');
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Reset password' : 'Enter Verification Code'}
      subtitle={
        step === 1
          ? "Enter your email and we'll send you a 6-digit code and reset link"
          : `We've sent a 6-digit code to ${userEmail}`
      }
    >
      {step === 1 ? (
        <form onSubmit={handleSubmit(handleRequestReset)} className="space-y-4">
          <Field error={errors.email?.message}>
            <label className="label">Registered Email</label>
            <InputWrap icon={FaEnvelope}>
              <input
                type="email"
                className="input !pl-10"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                })}
              />
            </InputWrap>
          </Field>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
            {isSubmitting ? 'Sending Code...' : 'Send Reset Code & Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(handleResetWithOtp)} className="space-y-4">
          <Field error={errors.otp?.message}>
            <label className="label">6-Digit Verification Code</label>
            <InputWrap icon={FaKey}>
              <input
                type="text"
                maxLength={6}
                className="input !pl-10 text-center font-mono tracking-widest text-lg font-bold"
                placeholder="123456"
                {...register('otp', {
                  required: '6-digit code is required',
                  minLength: { value: 6, message: 'Must be 6 digits' },
                })}
              />
            </InputWrap>
          </Field>

          <Field error={errors.password?.message}>
            <label className="label">New Password</label>
            <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
              <input
                type={showPw ? 'text' : 'password'}
                className="input !pl-10 !pr-10"
                placeholder="Min 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters required' },
                })}
              />
            </InputWrap>
          </Field>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
            {isSubmitting ? 'Updating Password...' : 'Save New Password & Login'}
          </button>

          <div className="flex justify-between items-center text-xs text-muted pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="hover:text-primary flex items-center gap-1 font-medium"
            >
              <FaArrowLeft className="h-3 w-3" /> Change email
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRequestReset({ email: userEmail })}
              className="text-primary hover:underline font-semibold"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-muted mt-6">
        Remember your password?{' '}
        <Link to="/auth/login" className="text-primary font-semibold hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
