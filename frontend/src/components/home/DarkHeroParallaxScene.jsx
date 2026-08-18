import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaBolt,
  FaGlobe,
  FaSackDollar,
  FaFire,
  FaCircleCheck,
  FaCode,
  FaUsers,
  FaArrowRight,
  FaBuilding,
  FaHexagonNodes,
  FaClock,
} from 'react-icons/fa6';
import { FadeIn } from '../ui/Motion';
import ScrollingClock from '../ui/ScrollingClock';
import ScrollingNumber from '../ui/ScrollingNumber';
import LiveSmokeEffect from './LiveSmokeEffect';

export const DarkHeroParallaxScene = () => {
  const [query, setQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const popular = ['Java Developer', 'Spring Boot', 'React', 'Python', 'Remote', 'AI / ML', 'Cloud DevOps', 'High Salary'];

  // Interactive mouse shift
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ x: x * 15, y: y * 15 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
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
      className="relative overflow-hidden min-h-[88vh] flex flex-col justify-center items-center bg-[#000000] text-white transition-colors duration-500 pt-16 pb-28 select-none"
    >
      {/* ── 1. Live Volumetric Smoke & Neon Fog Engine (Matching Reference) ─ */}
      <LiveSmokeEffect />

      {/* Ambient Deep Radial Backlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(168, 85, 247, 0.18) 0%, rgba(255, 45, 135, 0.12) 35%, rgba(0, 0, 0, 0.98) 75%)',
        }}
      />

      {/* ── 2. Glowing Neon Circular Podium / Stage (Matching Reference Image) ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 w-full max-w-[820px] flex flex-col items-center">
        {/* Upper Tier Cylinder Podium */}
        <div className="relative w-[340px] sm:w-[500px] h-[36px] rounded-[100%] bg-gradient-to-b from-[#1a1033] to-[#0d071a] border-t-2 border-[#ff2d87] shadow-[0_-2px_20px_#ff2d87,0_0_35px_rgba(255,45,135,0.6)]">
          {/* Inner Cyan Glow Ring */}
          <div className="absolute inset-x-8 top-1 h-[2px] bg-[#00f0ff] rounded-full shadow-[0_0_12px_#00f0ff]" />
        </div>

        {/* Lower Tier Base Podium Disc */}
        <div className="relative -mt-3 w-[460px] sm:w-[720px] h-[48px] rounded-[100%] bg-gradient-to-b from-[#0e0720] to-[#04010a] border-t-2 border-[#00f0ff] shadow-[0_-2px_30px_#00f0ff,0_10px_50px_rgba(0,240,255,0.4),0_0_70px_rgba(255,45,135,0.3)]">
          {/* Bottom Mirror Light Pool */}
          <div className="absolute inset-x-12 bottom-0 h-4 bg-gradient-to-t from-transparent via-[#ff2d87]/20 to-transparent blur-md" />
        </div>
      </div>

      {/* ── 3. Centered Cinematic Content Hub (Card Removed) ─────────── */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center py-6">
        <FadeIn>
          
          {/* Top Live Scrolling Digital Clock (Orionix Style Number Scroll) */}
          <div className="flex justify-center mb-6">
            <ScrollingClock size="md" neonColor="pink" showTimezone={true} />
          </div>

          {/* Night Club Multi-Color Neon Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-4">
            <span className="neon-text-pink inline-block mr-3">Night</span>
            <span className="neon-text-cyan inline-block">Careers</span>
            <br />
            <span className="text-white font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mt-3 block">
              Command Your <span className="neon-text-yellow">Dream Tech Job</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mt-5 max-w-2xl mx-auto leading-relaxed font-medium">
            Direct access to verified global tech leaders and high-growth AI startups. Real-time matching for Java Developers, Python Engineers, and Remote Specialists.
          </p>

          {/* Wide Glowing Command Search Input Box */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#ff2d87] via-[#a855f7] to-[#00f0ff] shadow-[0_0_40px_rgba(255,45,135,0.45)] transition-all duration-300 focus-within:shadow-[0_0_60px_rgba(0,240,255,0.7)]">
              <div className="flex items-center gap-2 rounded-[14px] bg-[#050711]/95 backdrop-blur-2xl p-2.5 pl-5">
                <FaMagnifyingGlass className="h-5 w-5 text-cyan-400 shrink-0 drop-shadow-[0_0_10px_#00f0ff]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Java Developer, Spring Boot, React, Remote, Bengaluru, Pune..."
                  className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-slate-400 py-2.5 pr-2 focus:ring-0"
                />
                <button
                  type="submit"
                  className="shrink-0 px-7 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-white shadow-[0_0_25px_rgba(255,45,135,0.7)] transition-all duration-200 cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <FaBolt className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Trending Hot Skill Neon Pills */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 mt-7 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <FaFire className="h-3.5 w-3.5 text-pink-400 animate-pulse" /> Hot Skills:
            </span>
            {popular.map((item, idx) => (
              <Link
                key={item}
                to={`/jobs?search=${encodeURIComponent(item)}`}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl backdrop-blur-xl bg-[#080C1E]/80 border transition-all duration-200 ${
                  idx % 3 === 0
                    ? 'border-pink-500/60 text-pink-300 hover:border-pink-400 hover:shadow-[0_0_18px_rgba(255,45,135,0.5)]'
                    : idx % 3 === 1
                    ? 'border-cyan-500/60 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_18px_rgba(0,240,255,0.5)]'
                    : 'border-amber-400/60 text-amber-300 hover:border-amber-300 hover:shadow-[0_0_18px_rgba(250,204,21,0.5)]'
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* ── 4. Live Mechanical Rolling Number Ticker Telemetry (Orionix Style) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12 pt-8 border-t border-slate-800/80 max-w-3xl mx-auto">
            {/* Live Jobs Pillar */}
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-[#080C1E]/60 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex flex-col items-center">
              <div className="h-10 flex items-center">
                <ScrollingNumber value="10,480+" height={38} width={22} fontSize="text-2xl sm:text-3xl" className="neon-text-cyan" />
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Active Tech Openings</p>
            </div>

            {/* Average Package Pillar */}
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-[#080C1E]/60 border border-pink-500/30 shadow-[0_0_20px_rgba(255,45,135,0.2)] flex flex-col items-center">
              <div className="h-10 flex items-center">
                <ScrollingNumber value="₹18-34 LPA" height={38} width={22} fontSize="text-2xl sm:text-3xl" className="neon-text-pink" />
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Average Compensation</p>
            </div>

            {/* AI Accuracy Pillar */}
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-[#080C1E]/60 border border-amber-400/30 shadow-[0_0_20px_rgba(250,204,21,0.2)] flex flex-col items-center">
              <div className="h-10 flex items-center">
                <ScrollingNumber value="98.7%" height={38} width={22} fontSize="text-2xl sm:text-3xl" className="neon-text-yellow" />
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">AI Matching Precision</p>
            </div>
          </div>

        </FadeIn>
      </div>

      {/* Bottom Seamless Gradient Fade into Black */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none z-10" />
    </section>
  );
};

export default DarkHeroParallaxScene;
