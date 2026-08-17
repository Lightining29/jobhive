import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaFacebookF } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Field, InputWrap } from './AuthShared';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Enter your credentials to access your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field error={errors.email?.message}>
          <label className="label text-slate-200 text-xs font-bold uppercase tracking-wider">Email Address</label>
          <InputWrap icon={FaEnvelope}>
            <input
              type="email"
              className="input !pl-10 !bg-slate-900/80 !border-slate-700/80 !text-white placeholder:!text-slate-500 focus:!border-amber-400 focus:!ring-2 focus:!ring-amber-400/20"
              placeholder="name@example.com"
              {...register('email', { required: 'Email is required' })}
            />
          </InputWrap>
        </Field>

        <Field error={errors.password?.message}>
          <label className="label text-slate-200 text-xs font-bold uppercase tracking-wider">Password</label>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input
              type={showPw ? 'text' : 'password'}
              className="input !pl-10 !pr-10 !bg-slate-900/80 !border-slate-700/80 !text-white placeholder:!text-slate-500 focus:!border-amber-400 focus:!ring-2 focus:!ring-amber-400/20"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
          </InputWrap>
        </Field>

        <div className="flex justify-between items-center text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none hover:text-white transition-colors">
            <input type="checkbox" className="rounded accent-amber-500 bg-slate-900 border-slate-700 h-4 w-4" /> Remember Me
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-amber-400 font-semibold hover:text-amber-300 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full !py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">or continue with</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-amber-400 hover:bg-slate-800 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <FaGoogle className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-amber-400 hover:bg-slate-800 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <FaGithub className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:border-amber-400 hover:bg-slate-800 hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <FaFacebookF className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      <p className="text-center text-xs text-slate-400 mt-6">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="text-amber-400 font-bold hover:text-amber-300 hover:underline transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};
