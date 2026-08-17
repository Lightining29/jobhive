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
    <AuthLayout title="Login" subtitle="Enter your credentials to access your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field error={errors.email?.message}>
          <label className="label text-cyan-200 text-xs font-bold uppercase tracking-wider">Email</label>
          <InputWrap icon={FaEnvelope}>
            <input
              type="email"
              className="input !pl-10 !bg-slate-900/90 backdrop-blur-md !border-cyan-400/70 !text-white placeholder:!text-cyan-300/50 focus:!border-cyan-300 focus:!shadow-[0_0_20px_rgba(0,240,255,0.6)]"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
            />
          </InputWrap>
        </Field>

        <Field error={errors.password?.message}>
          <label className="label text-cyan-200 text-xs font-bold uppercase tracking-wider">Password</label>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input
              type={showPw ? 'text' : 'password'}
              className="input !pl-10 !pr-10 !bg-slate-900/90 backdrop-blur-md !border-cyan-400/70 !text-white placeholder:!text-cyan-300/50 focus:!border-cyan-300 focus:!shadow-[0_0_20px_rgba(0,240,255,0.6)]"
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
            />
          </InputWrap>
        </Field>

        <div className="flex justify-between items-center text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-cyan-200/80 hover:text-white select-none transition-colors">
            <input type="checkbox" className="rounded accent-cyan-400 h-4 w-4 bg-slate-950 border-cyan-400/50" /> Remember Me
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-cyan-300 font-semibold hover:text-white hover:underline drop-shadow-[0_0_6px_rgba(0,240,255,0.8)] transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full !py-3 rounded-xl neon-btn-auth text-white font-extrabold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.99] cursor-pointer mt-2"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <div className="pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-cyan-500/30" />
            <span className="text-[11px] text-cyan-300/70 uppercase tracking-wider font-semibold">or continue with</span>
            <div className="h-px flex-1 bg-cyan-500/30" />
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-slate-950/30 backdrop-blur-md border border-cyan-400/50 flex items-center justify-center text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
            >
              <FaGoogle className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-slate-950/30 backdrop-blur-md border border-cyan-400/50 flex items-center justify-center text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
            >
              <FaGithub className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-slate-950/30 backdrop-blur-md border border-cyan-400/50 flex items-center justify-center text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
            >
              <FaFacebookF className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      <p className="text-center text-xs text-cyan-200/70 mt-6">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="text-pink-400 font-bold hover:text-pink-300 drop-shadow-[0_0_8px_rgba(255,0,127,0.85)] hover:underline transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};
