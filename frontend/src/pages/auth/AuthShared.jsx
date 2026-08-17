import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldHalved, FaBolt, FaUserCheck } from 'react-icons/fa6';
import { FaHexagonNodes } from 'react-icons/fa6';

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:py-12 bg-[#040812] relative overflow-x-hidden">
      {/* 3D Brick Wall Background Texture */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: "url('/brick-wall-dark.svg')",
          backgroundSize: '180px 90px',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center top'
        }}
      />

      {/* GPU-Accelerated Rolling Neon Fog */}
      <div className="neon-fog-container z-0 opacity-70">
        <div className="neon-fog-layer-1" />
        <div className="neon-fog-layer-2" />
        <div className="neon-fog-layer-3" />
      </div>

      {/* Ambient Cyberpunk Neon Backlights with Soft Voltage Breathing */}
      <div className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-pink-600/25 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-slow" />
      <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-slow" />

      <div className="relative w-full max-w-5xl mx-auto z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Cyberpunk Branding, Neon Portal & Badges */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
                <span className="relative h-11 w-11 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <FaHexagonNodes className="h-11 w-11 text-cyan-400 drop-shadow-[0_0_12px_rgba(0,240,255,0.85)]" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-4 w-4 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(255,0,127,0.95)] animate-pulse" />
                  </span>
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-2xl font-black text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.85)] tracking-wide">NeonX</span>
                  <span className="text-[11px] font-bold text-cyan-300 tracking-widest uppercase">Job Workplace</span>
                </div>
              </Link>

              <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-3">
                <span className="neon-font neon-glow-pink neon-flicker-sign inline-block text-5xl xl:text-6xl mr-2">
                  <span className="neon-flicker-fast">W</span>elcome
                </span>
                <span className="text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.85)]">
                  B<span className="neon-flicker-slow text-cyan-300">a</span>ck!
                </span>
              </h2>
              <p className="text-cyan-100/85 text-sm xl:text-base leading-relaxed max-w-md">
                Sign in to continue your journey with NeonX — Where Innovation Meets Style.
              </p>
            </div>

            {/* Glowing Neon Portal Ring Graphic with Skyline Silhouette and Flickering Aura */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="relative w-60 h-60 xl:w-64 xl:h-64 rounded-full border-4 border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.7),inset_0_0_30px_rgba(255,0,127,0.5)] flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-950/40 to-slate-950/90 neon-flicker-sign">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(255,0,127,0.45)_0%,transparent_70%)]" />
                {/* Cyberpunk City Skyline SVG */}
                <svg className="absolute bottom-0 inset-x-0 h-28 w-full text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" viewBox="0 0 200 100" fill="currentColor" preserveAspectRatio="none">
                  <rect x="10" y="45" width="18" height="55" fill="rgba(6,12,24,0.9)" stroke="currentColor" strokeWidth="1" />
                  <rect x="35" y="25" width="22" height="75" fill="rgba(6,12,24,0.9)" stroke="currentColor" strokeWidth="1" />
                  <rect x="65" y="55" width="16" height="45" fill="rgba(6,12,24,0.9)" stroke="currentColor" strokeWidth="1" />
                  <rect x="88" y="15" width="26" height="85" fill="rgba(6,12,24,0.9)" stroke="currentColor" strokeWidth="1" />
                  <rect x="120" y="40" width="20" height="60" fill="rgba(6,12,24,0.9)" stroke="currentColor" strokeWidth="1" />
                  <rect x="148" y="30" width="24" height="70" fill="rgba(6,12,24,0.9)" stroke="currentColor" strokeWidth="1" />
                  <rect x="178" y="50" width="15" height="50" fill="rgba(6,12,24,0.9)" stroke="currentColor" strokeWidth="1" />
                </svg>
                <div className="absolute -bottom-2 inset-x-0 h-12 bg-gradient-to-t from-pink-500/40 via-cyan-500/30 to-transparent blur-xs" />
              </div>
            </div>

            {/* 3 Neon Feature Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/70 border border-cyan-400/50 rounded-xl p-3 text-center backdrop-blur-md shadow-[0_0_14px_rgba(0,240,255,0.25)] hover:border-cyan-300 transition-colors">
                <FaShieldHalved className="h-5 w-5 text-cyan-300 mx-auto mb-1 drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
                <p className="text-xs font-bold text-white">Secure</p>
                <p className="text-[10px] text-cyan-200/70 leading-tight mt-0.5">Your data is safe with us.</p>
              </div>
              <div className="bg-slate-900/70 border border-pink-400/50 rounded-xl p-3 text-center backdrop-blur-md shadow-[0_0_14px_rgba(255,0,127,0.25)] hover:border-pink-300 transition-colors">
                <FaBolt className="h-5 w-5 text-pink-400 mx-auto mb-1 drop-shadow-[0_0_6px_rgba(255,0,127,0.8)]" />
                <p className="text-xs font-bold text-white">Fast</p>
                <p className="text-[10px] text-pink-200/70 leading-tight mt-0.5">Experience ultra-fast performance.</p>
              </div>
              <div className="bg-slate-900/70 border border-cyan-400/50 rounded-xl p-3 text-center backdrop-blur-md shadow-[0_0_14px_rgba(0,240,255,0.25)] hover:border-cyan-300 transition-colors">
                <FaUserCheck className="h-5 w-5 text-cyan-300 mx-auto mb-1 drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
                <p className="text-xs font-bold text-white">User Friendly</p>
                <p className="text-[10px] text-cyan-200/70 leading-tight mt-0.5">A simple and clean interface.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Neon Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            {/* Mobile Header */}
            <div className="flex lg:hidden justify-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <FaHexagonNodes className="h-9 w-9 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.85)]" />
                <span className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.85)]">NeonX</span>
              </Link>
            </div>

            <div className="neon-auth-card p-7 sm:p-10 shadow-2xl">
              <h1 className="text-3xl font-black text-center text-white neon-glow-cyan neon-flicker-sign mb-2">
                {title === 'Login' ? (
                  <>
                    L<span className="neon-flicker-fast text-cyan-300">o</span>gin
                  </>
                ) : (
                  title
                )}
              </h1>
              {subtitle && <p className="text-xs text-cyan-200/80 text-center mb-6 font-medium">{subtitle}</p>}
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
    {error && <p className="text-xs text-pink-400 mt-1 drop-shadow-[0_0_6px_rgba(255,0,127,0.7)] font-medium">{error}</p>}
  </div>
);

export const InputWrap = ({ icon: Icon, show, toggle, children }) => {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300 drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]">
        <Icon className="h-4 w-4" />
      </span>
      {children}
      {show !== undefined && (
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-white transition-colors cursor-pointer drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]"
          tabIndex={-1}
        >
          {show ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};

export const Icon = { FaEnvelope, FaLock, FaEye, FaEyeSlash };
