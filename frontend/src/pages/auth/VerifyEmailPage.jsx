import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCircleCheck, FaXmark } from 'react-icons/fa6';
import { authService } from '../../services';
import { AuthLayout } from './AuthShared';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('invalid');
      return;
    }
    (async () => {
      try {
        const { data } = await authService.verifyEmail(token);
        setStatus('success');
        toast.success(data.message);
        setTimeout(() => navigate('/candidate/dashboard'), 1500);
      } catch (err) {
        setStatus('invalid');
        toast.error(err.message);
      }
    })();
  }, [params, navigate]);

  return (
    <AuthLayout title="Email verification">
      {status === 'verifying' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="h-10 w-10 rounded-full border-4 border-line border-t-accent animate-spin" />
          <p className="text-sm text-muted">Verifying your email...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <FaCircleCheck className="h-12 w-12 text-emerald-500" />
          <p className="text-sm text-ink">Your email has been verified successfully.</p>
          <p className="text-xs text-muted">Redirecting to your dashboard...</p>
        </div>
      )}
      {status === 'invalid' && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <FaXmark className="h-12 w-12 text-red-500" />
          <p className="text-sm text-ink">This verification link is invalid or expired.</p>
        </div>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
