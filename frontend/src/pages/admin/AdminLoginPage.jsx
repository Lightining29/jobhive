import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaShieldHalved, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      if (user.role !== 'admin') {
        toast.error('Access Denied: This account does not have Administrator privileges.');
        return;
      }
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid administrator credentials');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2 shadow-inner">
            <FaShieldHalved className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            JobHive <span className="text-amber-400">Admin Portal</span>
          </h1>
          <p className="text-xs text-slate-400">
            Enter administrator credentials to access the management panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaEnvelope className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="brayw433@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                {...register('email', { required: 'Admin email is required' })}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaLock className="h-4 w-4" />
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm transition-all"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPw ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Admin Panel</span>
                <FaArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
          <Link
            to="/auth/login"
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            ← Return to Standard User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
