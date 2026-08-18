import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaWandMagicSparkles,
  FaBolt,
  FaGlobe,
  FaSackDollar,
  FaFire,
  FaCircleCheck,
  FaShieldHalved,
  FaBriefcase,
  FaCode,
  FaUsers,
  FaArrowRight,
  FaBuilding,
} from 'react-icons/fa6';
import { FadeIn } from '../ui/Motion';

export const DarkHeroParallaxScene = () => {
  const [query, setQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rx: 0, ry: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const popular = ['Java', 'React', 'Python', 'Remote', 'AI / ML', 'Cloud DevOps', 'High Salary'];

  // Scroll-based parallax tracker
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3D Perspective Mouse Tracker
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Normalize -1 to 1
    const nx = x / (rect.width / 2);
    const ny = y / (rect.height / 2);

    setMousePos({
      x: nx * 20, // px translation
      y: ny * 20,
      rx: -ny * 10, // deg tilt
      ry: nx * 10,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0, rx: 0, ry: 0 });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden min-h-[92vh] flex items-center bg-[#070B14] transition-colors duration-500 pt-16 pb-20 select-none"
    >
      {/* ── 1. Looping Background Video for Dark Mode ───────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-25 mix-blend-screen scale-105"
        >
          {/* Cyberpunk tech particle mesh background video */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-and-data-31911-large.mp4"
            type="video/mp4"
          />
        </video>
        {/* Fallback ambient generative neon glow if video is loading */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(250, 204, 21, 0.12) 0%, rgba(56, 189, 248, 0.08) 40%, rgba(7, 11, 20, 0.95) 85%)',
          }}
        />
      </div>

      {/* ── 2. Background Cyberpunk Grid & Depth Blobs ──────────────── */}
      <div className="pattern-grid absolute inset-0 opacity-20 pointer-events-none z-1" />
      <div
        className="aurora-blob -top-32 -left-20 h-[500px] w-[500px] pointer-events-none z-1 will-change-transform opacity-40"
        style={{
          transform: `translateY(${scrollY * 0.15}px) translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          background: 'radial-gradient(circle, rgba(250,204,21,0.3) 0%, rgba(250,204,21,0) 65%)',
        }}
      />
      <div
        className="aurora-blob top-1/3 -right-32 h-[550px] w-[550px] pointer-events-none z-1 will-change-transform opacity-30"
        style={{
          transform: `translateY(${scrollY * -0.2}px) translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px)`,
          background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0) 65%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── LEFT COLUMN: High-Impact Cyber Command Center ───────── */}
          <div className="lg:col-span-7 text-left">
            <FadeIn>
              {/* Pulsing AI Live Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-400/40 bg-slate-900/80 backdrop-blur-xl shadow-[0_0_20px_rgba(250,204,21,0.25)] text-amber-300 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest">
                  AI Job Telemetry • Live Grid
                </span>
              </div>

              {/* Main Glowing Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.06]">
                Command Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]">
                  Dream Career
                </span>{' '}
                In Tech.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 mt-6 max-w-xl leading-relaxed">
                Connect directly with verified tech leaders and AI startups. Real-time matching for Java Developers, Python Engineers, and Remote Tech Specialists.
              </p>

              {/* Glowing Search Command Input */}
              <form onSubmit={handleSearch} className="mt-8 max-w-xl">
                <div className="relative p-1 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all duration-300 focus-within:shadow-[0_0_40px_rgba(250,204,21,0.5)]">
                  <div className="flex items-center gap-2 rounded-[14px] bg-slate-950/95 backdrop-blur-2xl p-2 pl-4">
                    <FaMagnifyingGlass className="h-5 w-5 text-amber-400 shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Java Developer, Cloud, Remote, Pune, Bengaluru..."
                      className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-slate-500 py-2.5 pr-2 focus:ring-0"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-6 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                    >
                      <FaBolt className="h-4 w-4" />
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Popular Glowing Neon Keyword Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Trending:</span>
                {popular.map((item) => (
                  <Link
                    key={item}
                    to={`/jobs?search=${encodeURIComponent(item)}`}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.25)] transition-all duration-200"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* Live Impact Counters */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-800/80 max-w-xl">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">10,000+</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Verified Roles</p>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">₹14–32 LPA</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Avg Tech Salary</p>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">98.4%</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">AI Match Ratio</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── RIGHT COLUMN: Multi-Plane 3D Parallax Hologram Scene ─── */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px] perspective-1200">
            
            {/* Center Anchor: 3D Holographic Verified Candidate Card with Neon Border */}
            <div
              style={{
                transform: `rotateX(${mousePos.rx}deg) rotateY(${mousePos.ry}deg) translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 30px)`,
                transition: 'transform 0.12s ease-out',
              }}
              className="w-full max-w-[370px] rounded-3xl p-6 backdrop-blur-2xl bg-slate-900/85 border border-cyan-500/40 shadow-[0_0_40px_rgba(56,189,248,0.25)] relative z-20"
            >
              {/* Glowing Top Chip */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <FaCode className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Lead Java Architect</p>
                    <p className="text-[10px] text-slate-400">Full-Stack Cloud Core</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <FaCircleCheck className="h-2.5 w-2.5" /> 99% Match
                </span>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Java • Spring Boot • Microservices</span>
                  <span className="text-amber-400 font-black">₹24 LPA</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 w-11/12 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5">
                <Link
                  to="/jobs"
                  className="flex-1 py-2.5 rounded-xl font-extrabold text-xs text-center bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all flex items-center justify-center gap-1.5"
                >
                  <FaBolt className="h-3 w-3" /> Quick Apply
                </Link>
                <Link
                  to="/candidate/resume-upload"
                  className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center justify-center"
                >
                  AI Resume Scan
                </Link>
              </div>
            </div>

            {/* Parallax Layer 2: Floating Remote OK Neon Badge (Top-Left) */}
            <div
              style={{
                transform: `translate3d(${mousePos.x * -1.2}px, ${mousePos.y * -1.2 - scrollY * 0.1}px, 60px) rotate(-4deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="absolute -top-6 -left-6 sm:-left-10 z-30 p-3.5 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-amber-400/50 shadow-[0_0_25px_rgba(250,204,21,0.3)] flex items-center gap-3"
            >
              <span className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                <FaGlobe className="h-5 w-5 animate-spin-slow" />
              </span>
              <div>
                <p className="text-xs font-black text-white">100% Remote Hub</p>
                <p className="text-[10px] text-amber-300 font-semibold">Worldwide & India</p>
              </div>
            </div>

            {/* Parallax Layer 3: Floating High Compensation Badge (Bottom-Right) */}
            <div
              style={{
                transform: `translate3d(${mousePos.x * 1.4}px, ${mousePos.y * 1.4 + scrollY * 0.08}px, 70px) rotate(3deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="absolute -bottom-8 -right-4 sm:-right-8 z-30 p-3.5 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-3"
            >
              <span className="h-10 w-10 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
                <FaSackDollar className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black text-white">Instant Hiring</p>
                <p className="text-[10px] text-emerald-300 font-semibold">Verified Employers</p>
              </div>
            </div>

            {/* Parallax Layer 4: Floating Tech Nodes Ring (Top-Right) */}
            <div
              style={{
                transform: `translate3d(${mousePos.x * -0.7}px, ${mousePos.y * -0.7}px, 40px)`,
                transition: 'transform 0.18s ease-out',
              }}
              className="absolute top-8 right-0 sm:-right-4 z-10 p-2.5 rounded-xl backdrop-blur-md bg-slate-900/70 border border-cyan-500/30 shadow-md text-cyan-300 flex items-center gap-2 text-xs font-bold"
            >
              <FaFire className="h-4 w-4 text-rose-400" />
              <span>320+ Jobs Posted Today</span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#070B14] to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default DarkHeroParallaxScene;
