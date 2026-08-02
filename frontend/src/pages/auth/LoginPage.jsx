import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Field, InputWrap } from './AuthShared';
import GoogleLoginButton from '../../components/ui/GoogleLoginButton';

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
    <AuthLayout title="Welcome back" subtitle="Login to continue your job search">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field error={errors.email?.message}>
          <label className="label">Email</label>
          <InputWrap icon={FaEnvelope}>
            <input type="email" className="input !pl-10" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
          </InputWrap>
        </Field>
        <Field error={errors.password?.message}>
          <label className="label">Password</label>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input type={showPw ? 'text' : 'password'} className="input !pl-10 !pr-10" placeholder="••••••••" {...register('password', { required: 'Password is required' })} />
          </InputWrap>
        </Field>
        <div className="flex justify-between text-sm">
          <Link to="/auth/forgot-password" className="text-primary font-medium hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-line" />
        <span className="text-xs text-muted">or</span>
        <div className="flex-1 h-px bg-line" />
      </div>
      <GoogleLoginButton />
      <p className="text-center text-sm text-muted mt-6">
        New to JobHive? <Link to="/auth/register" className="text-primary font-semibold hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
};
