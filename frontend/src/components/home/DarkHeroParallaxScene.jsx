import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaBolt,
  FaFire,
} from 'react-icons/fa6';
import { FadeIn } from '../ui/Motion';
import ScrollingNumber from '../ui/ScrollingNumber';
import LiveSmokeEffect from './LiveSmokeEffect';

export const DarkHeroParallaxScene = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const popular = ['Java Developer', 'Spring Boot', 'React', 'Python', 'Remote', 'AI / ML', 'Cloud DevOps', 'High Salary'];

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
      className="relative overflow-hidden min-h-[86vh] flex flex-col justify-center items-center bg-[#000000] text-white transition-colors duration-500 pt-14 pb-24 select-none"
    >
      {/* ── 1. Optimized Volumetric Smoke Canvas (Silky Smooth 60fps) ─ */}
      <LiveSmokeEffect />

      {/* Ambient Deep Radial Backlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(168, 85, 247, 0.16) 0%, rgba(255, 45, 135, 0.1) 35%, rgba(0, 0, 0, 0.98) 75%)',
        }}
      />

      {/* ── 2. Glowing Neon Circular Podium / Stage ── */}
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

      {/* ── 3. Centered Cinematic Content Hub ──────────────────────── */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center py-6">
        <FadeIn>
          
          {/* Career Jobs (Pure White) & Dream Tech Jobs (BIG Neon Glow Text) */}
          <div className="mb-4">
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-widest uppercase block drop-shadow-md mb-2">
              Career Jobs
            </span>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[1.02]">
              <span className="neon-text-pink inline-block mr-3 sm:mr-6">Dream</span>
              <span className="neon-text-cyan inline-block mr-3 sm:mr-6">Tech</span>
              <span className="neon-text-yellow inline-block">Jobs</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mt-5 max-w-2xl mx-auto leading-relaxed font-medium">
            Direct access to verified global tech leaders and high-growth AI startups. Real-time matching for Java Developers, Python Engineers, and Remote Specialists.
          </p>

          {/* Wide Glowing Command Search Input Box */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#ff2d87] via-[#a855f7] to-[#00f0ff] shadow-[0_0_35px_rgba(255,45,135,0.45)] transition-all duration-300 focus-within:shadow-[0_0_55px_rgba(0,240,255,0.7)]">
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

          {/* Trending Hot Skill Neon Badges (Freepik Neon Playing Card Aesthetic) */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 mt-7 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 mr-1 flex items-center gap-1">
              <FaFire className="h-3.5 w-3.5 text-pink-400 animate-pulse" /> Hot Skills:
            </span>
            {popular.map((item, idx) => (
              <Link
                key={item}
                to={`/jobs?search=${encodeURIComponent(item)}`}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 ${
                  idx % 3 === 0
                    ? 'dark:neon-badge-pink'
                    : idx % 3 === 1
                    ? 'dark:neon-badge-cyan'
                    : 'dark:neon-badge-yellow'
                }`}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* ── 4. Live Mechanical Rolling Number Ticker Telemetry ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10 pt-7 border-t border-slate-800/80 max-w-3xl mx-auto">
            {/* Live Jobs Pillar */}
            <div className="p-4 rounded-2xl dark:neon-playing-card-cyan flex flex-col items-center">
              <div className="h-10 flex items-center">
                <ScrollingNumber value="10,480+" height={38} width={22} fontSize="text-2xl sm:text-3xl" className="neon-text-cyan" />
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Active Tech Openings</p>
            </div>

            {/* Average Package Pillar */}
            <div className="p-4 rounded-2xl dark:neon-playing-card-pink flex flex-col items-center">
              <div className="h-10 flex items-center">
                <ScrollingNumber value="₹18-34 LPA" height={38} width={22} fontSize="text-2xl sm:text-3xl" className="neon-text-pink" />
              </div>
              <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">Average Compensation</p>
            </div>

            {/* AI Accuracy Pillar */}
            <div className="p-4 rounded-2xl dark:neon-playing-card-yellow flex flex-col items-center">
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
