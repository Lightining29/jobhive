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
  FaHexagonNodes,
} from 'react-icons/fa6';
import { FadeIn } from '../ui/Motion';

export const DarkHeroParallaxScene = () => {
  const [query, setQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rx: 0, ry: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const popular = ['Java', 'React', 'Python', 'Remote', 'AI / ML', 'Cloud DevOps', 'Spring Boot'];

  // Parallax scroll listener
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

  // 3D Perspective interactive mouse listener
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const nx = x / (rect.width / 2);
    const ny = y / (rect.height / 2);

    setMousePos({
      x: nx * 24, // px offset
      y: ny * 24,
      rx: -ny * 12, // deg 3d tilt
      ry: nx * 12,
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
      className="relative overflow-hidden min-h-[92vh] flex items-center bg-[#050711] transition-colors duration-500 pt-16 pb-20 select-none"
    >
      {/* ── 1. Looping High-Tech Particle Video Layer ────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30 mix-blend-screen scale-105"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-and-data-31911-large.mp4"
            type="video/mp4"
          />
        </video>
        {/* Deep ambient dark backdrop overlay */}
        <div
          className="absolute inset-0 opacity-85"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 15%, rgba(255, 45, 135, 0.12) 0%, rgba(0, 240, 255, 0.10) 35%, rgba(5, 7, 17, 0.96) 80%)',
          }}
        />
      </div>

      {/* ── 2. Ambient Neon Glow Spheres ────────────────────────────── */}
      <div className="pattern-grid absolute inset-0 opacity-25 pointer-events-none z-1" />
      <div
        className="aurora-blob -top-28 -left-20 h-[520px] w-[520px] pointer-events-none z-1 will-change-transform opacity-60"
        style={{
          transform: `translateY(${scrollY * 0.15}px) translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
          background: 'radial-gradient(circle, rgba(255,45,135,0.35) 0%, rgba(255,45,135,0) 65%)',
        }}
      />
      <div
        className="aurora-blob top-1/3 -right-32 h-[550px] w-[550px] pointer-events-none z-1 will-change-transform opacity-50"
        style={{
          transform: `translateY(${scrollY * -0.2}px) translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
          background: 'radial-gradient(circle, rgba(0,240,255,0.3) 0%, rgba(0,240,255,0) 65%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── LEFT: Night Club Style Glowing Neon Typography & Search ── */}
          <div className="lg:col-span-7 text-left">
            <FadeIn>
              {/* Pulsing AI Live Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-pink-500/60 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_20px_rgba(255,45,135,0.4)] text-pink-300 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-400" />
                </span>
                <span className="text-xs font-black uppercase tracking-widest">
                  AI Smart Match • Live Neon Grid
                </span>
              </div>

              {/* Night Club Style Multi-Color Neon Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-4">
                <span className="neon-text-pink inline-block mr-3">Night</span>
                <span className="neon-text-cyan inline-block">Careers</span>
                <br />
                <span className="text-white font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight mt-2 block">
                  Find Your <span className="neon-text-yellow">Dream Job</span>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 mt-6 max-w-xl leading-relaxed">
                Connect directly with verified tech leaders and AI startups. Real-time matching for Java Developers, Python Engineers, and Remote Specialists worldwide.
              </p>

              {/* Neon Cyan & Pink Glowing Search Command */}
              <form onSubmit={handleSearch} className="mt-8 max-w-xl">
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#ff2d87] via-[#a855f7] to-[#00f0ff] shadow-[0_0_35px_rgba(255,45,135,0.45)] transition-all duration-300 focus-within:shadow-[0_0_50px_rgba(0,240,255,0.6)]">
                  <div className="flex items-center gap-2 rounded-[14px] bg-[#070b18]/95 backdrop-blur-2xl p-2 pl-4">
                    <FaMagnifyingGlass className="h-5 w-5 text-cyan-400 shrink-0 drop-shadow-[0_0_8px_#00f0ff]" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Java Developer, Full Stack, Remote, Pune, Bengaluru..."
                      className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-slate-400 py-2.5 pr-2 focus:ring-0"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-6 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-white shadow-[0_0_20px_rgba(255,45,135,0.6)] transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                    >
                      <FaBolt className="h-4 w-4" />
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Popular Glowing Neon Keyword Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Hot Skills:</span>
                {popular.map((item, idx) => (
                  <Link
                    key={item}
                    to={`/jobs?search=${encodeURIComponent(item)}`}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md bg-slate-900/80 border transition-all duration-200 ${
                      idx % 3 === 0
                        ? 'border-pink-500/50 text-pink-300 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(255,45,135,0.4)]'
                        : idx % 3 === 1
                        ? 'border-cyan-500/50 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'border-amber-400/50 text-amber-300 hover:border-amber-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* Glowing Impact Stats */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-800 max-w-xl">
                <div>
                  <p className="text-2xl sm:text-3xl font-black neon-text-cyan">10,000+</p>
                  <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wide">Live Jobs</p>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <p className="text-2xl sm:text-3xl font-black neon-text-pink">₹14–32 LPA</p>
                  <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wide">Top Salary</p>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <p className="text-2xl sm:text-3xl font-black neon-text-yellow">98.4%</p>
                  <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wide">AI Match</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── RIGHT: Authentic Transparent Neon Acrylic Glass Card ─────── */}
          {/* Matches the Paloma Branches Reference Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[500px] perspective-1200">
            
            {/* Center Anchor Card: Holographic Transparent Neon Pink Glass */}
            <div
              style={{
                transform: `rotateX(${mousePos.rx}deg) rotateY(${mousePos.ry}deg) translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 30px)`,
                transition: 'transform 0.12s ease-out',
              }}
              className="w-full max-w-[340px] sm:max-w-[360px] rounded-[32px] p-6 neon-acrylic-pink relative z-20 flex flex-col items-center text-center select-none"
            >
              {/* Top Neon Hexagon Icon (like Instagram icon in reference) */}
              <div className="w-full flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-2xl border-2 border-pink-500 flex items-center justify-center text-pink-400 shadow-[0_0_15px_#ff2d87,inset_0_0_8px_#ff2d87]">
                  <FaHexagonNodes className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/60 shadow-[0_0_12px_rgba(255,45,135,0.4)]">
                  Verified Candidate
                </span>
              </div>

              {/* Glowing Circular Avatar with Neon Pink Halo Ring */}
              <div className="relative my-2">
                <div className="h-28 w-28 rounded-full overflow-hidden neon-avatar-ring-pink p-1 bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                    alt="Verified Candidate"
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-[0_0_10px_#10b981] flex items-center justify-center text-slate-950 text-xs">
                  <FaCircleCheck className="h-3.5 w-3.5 text-white" />
                </span>
              </div>

              {/* Candidate Name in Crisp Glowing White Font */}
              <h3 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
                Aarav Sharma
              </h3>
              <p className="text-xs font-bold text-pink-300 tracking-wide mt-0.5">
                Lead Java & AI Architect
              </p>

              {/* Profile Handle */}
              <p className="text-xs font-semibold text-slate-300 mt-2 flex items-center gap-1.5">
                <FaCode className="h-3.5 w-3.5 text-pink-400" />
                <span>@aarav.dev • Pune, India</span>
              </p>

              {/* 3-Column Glass Stats Grid (Matching 18 POSTS, 7846 FOLLOWERS) */}
              <div className="grid grid-cols-3 gap-2 w-full mt-5 py-3 border-y border-pink-500/30">
                <div className="text-center">
                  <p className="text-base font-black text-white drop-shadow-[0_0_8px_#fff]">12+</p>
                  <p className="text-[9px] font-bold text-pink-300 uppercase tracking-wider mt-0.5">Years Exp</p>
                </div>
                <div className="text-center border-x border-pink-500/30">
                  <p className="text-base font-black text-amber-300 drop-shadow-[0_0_8px_#ffd700]">₹28 LPA</p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Offered</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]">99.2%</p>
                  <p className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider mt-0.5">Match Score</p>
                </div>
              </div>

              {/* Glowing Email / Contact Line */}
              <p className="text-[11px] font-medium text-slate-300 mt-3.5 tracking-tight">
                aarav.sharma.dev@jobworkplace.com
              </p>

              {/* Bottom Quick Action */}
              <div className="w-full mt-4 flex gap-2">
                <Link
                  to="/jobs"
                  className="flex-1 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-[0_0_18px_rgba(255,45,135,0.6)] transition-all flex items-center justify-center gap-1.5"
                >
                  <FaBolt className="h-3 w-3" /> Hire Candidate
                </Link>
                <Link
                  to="/auth/register"
                  className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-slate-900/80 hover:bg-slate-800 text-white border border-pink-500/40 transition-all flex items-center justify-center shadow-xs"
                >
                  Get Smart I-Card
                </Link>
              </div>
            </div>

            {/* Parallax Floating Layer 2: Neon Cyan Acrylic Badge (Top-Left) */}
            <div
              style={{
                transform: `translate3d(${mousePos.x * -1.3}px, ${mousePos.y * -1.3 - scrollY * 0.1}px, 60px) rotate(-5deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="absolute -top-6 -left-6 sm:-left-10 z-30 p-3.5 rounded-2xl neon-acrylic-cyan flex items-center gap-3"
            >
              <span className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_#00f0ff]">
                <FaGlobe className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black text-white drop-shadow-[0_0_8px_#fff]">100% Remote Hub</p>
                <p className="text-[10px] text-cyan-300 font-bold">Worldwide & India</p>
              </div>
            </div>

            {/* Parallax Floating Layer 3: Neon Gold Acrylic Badge (Bottom-Right) */}
            <div
              style={{
                transform: `translate3d(${mousePos.x * 1.5}px, ${mousePos.y * 1.5 + scrollY * 0.08}px, 70px) rotate(4deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="absolute -bottom-8 -right-4 sm:-right-8 z-30 p-3.5 rounded-2xl neon-acrylic-yellow flex items-center gap-3"
            >
              <span className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400 flex items-center justify-center shadow-[0_0_12px_#ffd700]">
                <FaSackDollar className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black text-white drop-shadow-[0_0_8px_#fff]">Instant Hiring</p>
                <p className="text-[10px] text-amber-300 font-bold">500+ Top Employers</p>
              </div>
            </div>

            {/* Parallax Floating Layer 4: Neon Purple Hot Badge (Top-Right) */}
            <div
              style={{
                transform: `translate3d(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px, 45px)`,
                transition: 'transform 0.18s ease-out',
              }}
              className="absolute top-6 right-0 sm:-right-4 z-10 p-2.5 rounded-xl neon-acrylic-purple text-purple-300 flex items-center gap-2 text-xs font-bold"
            >
              <FaFire className="h-4 w-4 text-pink-400 animate-pulse" />
              <span className="text-white drop-shadow-[0_0_6px_#c084fc]">320+ Hot Jobs Today</span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#050711] to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default DarkHeroParallaxScene;
