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
          <label className="label text-slate-700 text-xs font-semibold uppercase tracking-wider">Email</label>
          <InputWrap icon={FaEnvelope}>
            <input
              type="email"
              className="input !pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
            />
          </InputWrap>
        </Field>

        <Field error={errors.password?.message}>
          <label className="label text-slate-700 text-xs font-semibold uppercase tracking-wider">Password</label>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input
              type={showPw ? 'text' : 'password'}
              className="input !pl-10 !pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
            />
          </InputWrap>
        </Field>

        <div className="flex justify-between items-center text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none transition-colors">
            <input type="checkbox" className="rounded accent-primary-600 h-4 w-4 border-slate-300" /> Remember Me
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full !py-3 font-bold text-sm tracking-wider cursor-pointer mt-2"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <div className="pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <FaGoogle className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <FaGithub className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-10 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <FaFacebookF className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      <p className="text-center text-xs text-slate-600 mt-6">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
