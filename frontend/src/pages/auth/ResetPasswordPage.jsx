import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { authService } from '../../services';
import { AuthLayout, Field, InputWrap } from './AuthShared';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      const token = params.get('token');
      if (!token) {
        toast.error('Invalid reset link');
        return;
      }
      const { data } = await authService.resetPassword(token, password);
      toast.success(data.message);
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field error={errors.password?.message}>
          <label className="label">New password</label>
          <InputWrap icon={FaLock} show={showPw} toggle={() => setShowPw((s) => !s)}>
            <input type={showPw ? 'text' : 'password'} className="input !pl-10 !pr-10" placeholder="Min 8 characters" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
          </InputWrap>
        </Field>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
      <p className="text-center text-sm text-muted mt-6">
        <Link to="/auth/login" className="text-primary font-semibold hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
