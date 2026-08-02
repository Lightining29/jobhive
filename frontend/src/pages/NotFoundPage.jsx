import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
    <p className="text-8xl font-black text-ink">404</p>
    <h1 className="text-2xl font-bold mt-4">Page not found</h1>
    <p className="text-muted mt-2 mb-6">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" className="btn-primary">Go home</Link>
  </div>
);

export default NotFoundPage;
