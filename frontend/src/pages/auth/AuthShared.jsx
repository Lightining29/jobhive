import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBolt,
  FaHexagonNodes,
  FaFire,
  FaShieldHalved,
  FaUserCheck,
} from 'react-icons/fa6';
import { useTheme } from '../../context/ThemeContext';

export const AuthLayout = ({ title = 'Welcome back', subtitle, children, isRegister = false }) => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#07070a] dark:bg-[#000000] text-white relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
      
      {/* ── 1. LEFT SIDE (Desktop 50% Full-Screen Cinematic Artwork) ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 min-h-screen relative overflow-hidden flex-col justify-between p-8 lg:p-14 select-none">
        {/* Full-bleed background artwork */}
        <img
          src="/assets/auth-voxel-art.jpg"
          alt="Job Workplace AI Fantasy Landscape"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-1000 ease-out"
        />
        
        {/* High-end Cinematic Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/40 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#07070a] pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="h-10 w-10 rounded-2xl bg-pink-500/30 backdrop-blur-md border border-pink-400/60 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(255,45,135,0.6)] group-hover:scale-105 transition-transform">
              <FaFire className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow-md">
                Job Workplace <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-extrabold backdrop-blur-sm border border-white/20">AI</span>
              </span>
              <span className="text-[11px] font-bold text-pink-300 tracking-wider uppercase">Next-Gen Careers</span>
            </div>
          </Link>
        </div>

        {/* Bottom Tagline & Ambient Highlights */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>10,480+ Live Opportunities Active</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            Find Your Dream Job <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">
              Powered by AI.
            </span>
          </h2>

          <p className="text-sm text-slate-300 max-w-sm leading-relaxed font-medium">
            Automate your applications, match with verified tech employers, and unlock compensation parity.
          </p>
        </div>
      </div>

      {/* ── 2. MOBILE TOP BANNER (Edge-to-Edge Fluid Header) ───────── */}
      <div className="md:hidden relative h-56 sm:h-64 w-full overflow-hidden select-none shrink-0">
        <img
          src="/assets/auth-voxel-art.jpg"
          alt="Job Workplace AI"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Seamless bottom fade into black */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/60 to-black/30 pointer-events-none" />
        
        {/* Mobile Top Brand Bar */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-pink-500/30 backdrop-blur-md border border-pink-400/60 flex items-center justify-center text-pink-400 shadow-[0_0_12px_rgba(255,45,135,0.6)]">
              <FaFire className="h-4 w-4" />
            </span>
            <span className="text-base font-black text-white drop-shadow-md">
              Job Workplace <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-bold">AI</span>
            </span>
          </Link>
        </div>
      </div>

      {/* ── 3. RIGHT SIDE (Full-Screen Form Panel) ─────────────────── */}
      <div className="w-full md:w-1/2 lg:w-7/12 min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-8 sm:py-12 bg-[#07070a] dark:bg-[#000000] relative">
        
        {/* Subtle Ambient Glow in background */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm sm:max-w-md mx-auto relative z-10">
          
          <div className="mb-7 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>

    </div>
  );
};

export const Field = ({ error, children }) => (
  <div className="w-full">
    {children}
    {error && <p className="text-xs text-rose-400 mt-1.5 font-medium pl-1">{error}</p>}
  </div>
);

export const InputWrap = ({ icon: Icon, show, toggle, children }) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="h-4 w-4" />
        </span>
      )}
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

export const GoogleAuthButton = ({ onClick, text = 'Continue with Google' }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-3.5 px-6 rounded-full bg-[#141418] hover:bg-[#1c1c22] border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
  >
    {/* Clean Multi-Color Google G Icon */}
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
    <span>{text}</span>
  </button>
);
