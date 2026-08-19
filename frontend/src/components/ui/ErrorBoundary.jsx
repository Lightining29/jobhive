import React from 'react';
import { FaTriangleExclamation, FaRotateRight, FaHouse } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
    const msg = String(error?.message || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('dynamically imported module') ||
      msg.includes('Importing a module script failed')
    ) {
      const alreadyRetried = window.sessionStorage.getItem('chunk_boundary_reload') === 'true';
      if (!alreadyRetried) {
        window.sessionStorage.setItem('chunk_boundary_reload', 'true');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.sessionStorage.removeItem('chunk_boundary_reload');
    window.sessionStorage.removeItem('chunk_retry');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="card max-w-lg p-8 space-y-4 shadow-xl border border-red-500/20 bg-surface">
            <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-600 mb-2">
              <FaTriangleExclamation className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-ink">Something went wrong</h2>
            <p className="text-sm text-muted">
              {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={this.handleReload}
                className="btn-primary !py-2 !px-4 text-xs font-semibold gap-2"
              >
                <FaRotateRight className="h-3.5 w-3.5" />
                Reload Page
              </button>
              <Link to="/admin/dashboard" className="btn-outline !py-2 !px-4 text-xs font-semibold gap-2">
                <FaHouse className="h-3.5 w-3.5" />
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
