import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaEnvelope } from 'react-icons/fa6';
import { authService } from '../../services';
import { AuthLayout, Field, InputWrap } from './AuthShared';

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      const { data } = await authService.forgotPassword(email);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field error={errors.email?.message}>
          <label className="label">Email</label>
          <InputWrap icon={FaEnvelope}>
            <input type="email" className="input !pl-10" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
          </InputWrap>
        </Field>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="text-center text-sm text-muted mt-6">
        Remembered it? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
