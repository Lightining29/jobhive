import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldHalved, FaBolt, FaUserCheck } from 'react-icons/fa6';
import { FaHexagonNodes } from 'react-icons/fa6';

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 relative">
      <div className="relative w-full max-w-5xl mx-auto z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Branding & Feature Badges */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
                <span className="relative h-11 w-11 flex items-center justify-center bg-primary-600 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                  <FaHexagonNodes className="h-6 w-6" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-2xl font-black text-slate-900 tracking-wide">JobHive</span>
                  <span className="text-[11px] font-bold text-primary-600 tracking-widest uppercase">Career Portal</span>
                </div>
              </Link>

              <h2 className="text-4xl xl:text-5xl font-black text-slate-900 leading-tight mb-3">
                Welcome <span className="text-primary-600">Back!</span>
              </h2>
              <p className="text-slate-600 text-sm xl:text-base leading-relaxed max-w-md">
                Sign in to discover opportunities, connect with top employers, and accelerate your career.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-sm">
                <FaShieldHalved className="h-5 w-5 text-primary-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Secure</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Encrypted & verified</p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-sm">
                <FaBolt className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Fast</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">1-click applications</p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-sm">
                <FaUserCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-900">AI Matched</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Personalized jobs</p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Light Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            {/* Mobile Header */}
            <div className="flex lg:hidden justify-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <span className="h-10 w-10 flex items-center justify-center bg-primary-600 rounded-xl text-white shadow-md">
                  <FaHexagonNodes className="h-5 w-5" />
                </span>
                <span className="text-2xl font-black text-slate-900">JobHive</span>
              </Link>
            </div>

            <div className="bg-white p-7 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-2">
                {title}
              </h1>
              {subtitle && <p className="text-xs sm:text-sm text-slate-500 text-center mb-6 font-medium">{subtitle}</p>}
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export const Field = ({ error, children }) => (
  <div>
    {children}
    {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
  </div>
);

export const InputWrap = ({ icon: Icon, show, toggle, children }) => {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon className="h-4 w-4" />
      </span>
      {children}
      {show !== undefined && (
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};

export const Icon = { FaEnvelope, FaLock, FaEye, FaEyeSlash };
