import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../ui/States';

export const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

export const GuestRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace />;
  return <Outlet />;
};
