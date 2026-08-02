import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding, FaUserTie } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Field, InputWrap } from './AuthShared';
import GoogleLoginButton from '../../components/ui/GoogleLoginButton';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('candidate');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await registerUser({ ...values, role });
      navigate(user.role === 'recruiter' ? '/recruiter/company' : '/candidate/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join JobHive and find your dream job">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'candidate' ? 'bg-white shadow-sm text-primary-700' : 'text-muted'}`}
          >
            <FaUserTie className="h-4 w-4" /> Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'recruiter' ? 'bg-white shadow-sm text-primary-700' : 'text-muted'}`}
          >
            <FaBuilding className="h-4 w-4" /> Recruiter
          </button>
        </div>

        <Field error={errors.name?.message}>
          <label className="label">Full name</label>
          <InputWrap icon={FaUser}>
            <input className="input !pl-10" placeholder="Jane Doe" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
          </InputWrap>
        </Field>

        <Field error={errors.email?.message}>
          <label className="label">Email</label>
          <InputWrap icon={FaEnvelope}>
            <input type="email" className="input !pl-10" placeholder="you@example.com" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
          </InputWrap>
        </Field>

        <Field error={errors.password?.message}>
          <label className="label">Password</label>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input type={showPw ? 'text' : 'password'} className="input !pl-10 !pr-10" placeholder="Min 8 characters" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
          </InputWrap>
        </Field>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
          {isSubmitting ? 'Creating account...' : `Sign up as ${role === 'candidate' ? 'Candidate' : 'Recruiter'}`}
        </button>
      </form>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-line" />
        <span className="text-xs text-muted">or</span>
        <div className="flex-1 h-px bg-line" />
      </div>
      <GoogleLoginButton role={role} />
      <p className="text-center text-sm text-muted mt-6">
        Already have an account? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
