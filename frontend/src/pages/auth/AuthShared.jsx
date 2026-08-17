import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { FaHexagonNodes } from 'react-icons/fa6';

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#070c14]">
      {/* Photorealistic Brick Wall with Overhead Lamp Spotlight */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/brick-spotlight.jpg')" }}
      />
      
      {/* Subtle Ambient Vignette Lighting Overlay */}
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/85 pointer-events-none" />

      {/* Realistic Acrylic Smoked Glass Login Card */}
      <div className="relative w-full max-w-md z-10 my-auto">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.12)]">
          
          {/* Logo Header */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="relative h-11 w-11 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FaHexagonNodes className="h-11 w-11 text-amber-400 drop-shadow-md" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                </span>
              </span>
              <div className="flex flex-col leading-tight items-start">
                <span className="text-xl font-black text-white tracking-tight">Job Workplace</span>
                <span className="text-xs font-bold tracking-tight">
                  <span className="text-red-500">Apple</span><span className="text-emerald-400">tree</span> <span className="text-slate-300">infotech</span>
                </span>
              </div>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-center text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-amber-200/80 text-center mt-1 mb-6 font-medium">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export const Field = ({ error, children }) => (
  <div>
    {children}
    {error && <p className="text-xs text-red-400 mt-1 font-medium">{error}</p>}
  </div>
);

export const InputWrap = ({ icon: Icon, show, toggle, children }) => {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/80">
        <Icon className="h-4 w-4" />
      </span>
      {children}
      {show !== undefined && (
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};

export const Icon = { FaEnvelope, FaLock, FaEye, FaEyeSlash };
