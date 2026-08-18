import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaRegEnvelope, FaLock } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Field, InputWrap, GoogleAuthButton } from './AuthShared';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      navigate(
        user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'recruiter'
          ? '/recruiter/dashboard'
          : '/candidate/dashboard'
      );
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = () => {
    toast('Google Single Sign-On initializing...', { icon: '🔑' });
  };

  return (
    <AuthLayout title="Welcome back" isRegister={false}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        
        {/* Email Address Input Pill (Matching Reference) */}
        <Field error={errors.email?.message}>
          <InputWrap icon={FaRegEnvelope}>
            <input
              type="email"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#16161c] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all shadow-inner"
              placeholder="Email address"
              {...register('email', { required: 'Email address is required' })}
            />
          </InputWrap>
        </Field>

        {/* Password Input Pill (Matching Reference) */}
        <Field error={errors.password?.message}>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input
              type={showPw ? 'text' : 'password'}
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#16161c] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all shadow-inner"
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
            />
          </InputWrap>
        </Field>

        <div className="flex justify-between items-center text-xs pt-1 px-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
            <input type="checkbox" className="rounded accent-rose-500 h-3.5 w-3.5 border-slate-300 dark:border-slate-700" />
            <span>Remember Me</span>
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-rose-500 hover:text-rose-400 font-semibold hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Coral/Crimson Primary Button: Continue with Email */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#f43f5e] hover:to-[#fb7185] shadow-[0_4px_22px_rgba(225,29,72,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? 'Authenticating...' : 'Continue with Email'}
          </button>
        </div>

        {/* Secondary Button: Continue with Google */}
        <div className="pt-1">
          <GoogleAuthButton onClick={handleGoogleLogin} text="Continue with Google" />
        </div>
      </form>

      {/* Switch Link: Don't have an account? Sign Up */}
      <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 font-medium">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="text-[#f43f5e] font-bold hover:underline ml-1"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
