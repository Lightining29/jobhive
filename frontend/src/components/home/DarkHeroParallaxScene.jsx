import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaBolt,
  FaFire,
  FaArrowRight,
  FaCheck,
  FaLaptopCode,
  FaBrain,
  FaCloud,
  FaShieldHalved,
  FaBuilding,
  FaUsers,
  FaBriefcase,
  FaStar,
} from 'react-icons/fa6';
import { FadeIn } from '../ui/Motion';
import ScrollingNumber from '../ui/ScrollingNumber';
import LiveSmokeEffect from './LiveSmokeEffect';

export const DarkHeroParallaxScene = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const curatedCategories = [
    { label: 'Java & Spring Boot', count: '2,450+ Jobs', tag: 'Java Developer', icon: FaLaptopCode, badgeClass: 'dark:neon-badge-pink' },
    { label: 'AI & Machine Learning', count: '1,280+ Jobs', tag: 'AI / ML', icon: FaBrain, badgeClass: 'dark:neon-badge-cyan' },
    { label: 'React & Fullstack', count: '3,150+ Jobs', tag: 'React', icon: FaBolt, badgeClass: 'dark:neon-badge-yellow' },
    { label: 'Python & Data', count: '1,920+ Jobs', tag: 'Python', icon: FaLaptopCode, badgeClass: 'dark:neon-badge-emerald' },
    { label: 'Cloud DevOps & AWS', count: '1,420+ Jobs', tag: 'Cloud DevOps', icon: FaCloud, badgeClass: 'dark:neon-badge-cyan' },
    { label: 'Remote Anywhere', count: '4,600+ Jobs', tag: 'Remote', icon: FaFire, badgeClass: 'dark:neon-badge-pink' },
  ];

  const quickFilterTabs = [
    { id: 'all', label: '🔥 All Active Roles', query: '' },
    { id: 'high_salary', label: '💰 ₹25+ LPA High CTC', query: 'High Salary' },
    { id: 'startups', label: '🚀 AI Startups Hiring', query: 'AI' },
    { id: 'remote', label: '🌐 100% Remote Global', query: 'Remote' },
    { id: 'java', label: '☕ Java Specialist', query: 'Java' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    if (tab.query) {
      navigate(`/jobs?search=${encodeURIComponent(tab.query)}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <section
      className="relative overflow-hidden min-h-[88vh] flex flex-col justify-center items-center bg-[#000000] text-white transition-colors duration-500 pt-10 pb-24 select-none"
    >
      {/* ── 1. Optimized Volumetric Smoke Engine (60fps Fluid) ───── */}
      <LiveSmokeEffect />

      {/* Ambient Deep Radial Backlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-75"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(168, 85, 247, 0.15) 0%, rgba(255, 45, 135, 0.08) 35%, rgba(0, 0, 0, 0.98) 75%)',
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

      {/* ── 3. Centered Content Hub (Parallax Removed for instant snappy speed) ── */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center py-4">
        <FadeIn>

          {/* Live Activity Telemetry Strip */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0d1124]/90 border border-cyan-500/40 shadow-[0_0_18px_rgba(0,240,255,0.25)] text-xs text-slate-200 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-semibold">Live Feed:</span>
            <span className="text-cyan-300 font-bold">10,480+ Active Tech Positions</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">340+ Verified Companies Hiring</span>
          </div>
          
          {/* ── MAIN HEADLINE: ONLY "Dream Job" IS NEON WITH LETTER-BY-LETTER FLICKER, REST IS WHITE ── */}
          <div className="mb-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08]">
              <span className="text-white inline-block mr-3 sm:mr-4">
                Find Your
              </span>
              <span className="inline-block">
                <span className="neon-letter">D</span>
                <span className="neon-letter">r</span>
                <span className="neon-letter neon-letter-flicker-1">e</span>
                <span className="neon-letter">a</span>
                <span className="neon-letter">m</span>
                <span className="inline-block w-2.5 sm:w-4" />
                <span className="neon-letter">J</span>
                <span className="neon-letter neon-letter-flicker-2">o</span>
                <span className="neon-letter">b</span>
              </span>
              <br />
              <span className="text-white font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight mt-2 inline-block">
                Today
              </span>
            </h1>
          </div>

          {/* Subtitle & Value Proposition */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Direct matching with verified tech giants, unicorn startups, and high-growth engineering teams across India & Global Remote hubs.
          </p>

          {/* ── Interactive Quick Filter Tabs ── */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-6 max-w-3xl mx-auto">
            {quickFilterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.7)] scale-105'
                    : 'bg-[#0b0f1e]/90 text-slate-300 border border-slate-700 hover:border-cyan-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Wide Fully Rounded Glowing Command Search Box (Pill Shape) ── */}
          <form onSubmit={handleSearch} className="mt-6 max-w-2xl mx-auto">
            <div className="relative p-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-[0_0_35px_rgba(0,240,255,0.55)] transition-all duration-300 focus-within:shadow-[0_0_55px_rgba(0,240,255,0.95)]">
              <div className="flex items-center gap-2 rounded-full bg-[#050711]/95 backdrop-blur-2xl p-2 pl-5">
                <FaMagnifyingGlass className="h-5 w-5 text-cyan-400 shrink-0 drop-shadow-[0_0_10px_#00f0ff]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Java Developer, Spring Boot, React, Remote, Bengaluru..."
                  className="w-full bg-transparent border-none outline-none text-white text-sm sm:text-base placeholder:text-slate-400 py-2.5 pr-2 focus:ring-0"
                />
                <button
                  type="submit"
                  className="shrink-0 px-7 py-3 rounded-full font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.8)] transition-all duration-200 cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <FaBolt className="h-3.5 w-3.5" />
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* ── Rich Interactive Category Badges Grid (Enhanced Content) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-8 max-w-4xl mx-auto">
            {curatedCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.tag}
                  to={`/jobs?search=${encodeURIComponent(cat.tag)}`}
                  className={`p-2.5 rounded-2xl transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center group ${cat.badgeClass}`}
                >
                  <Icon className="h-4 w-4 mb-1 shrink-0 text-white" />
                  <span className="text-[11px] font-bold text-white block leading-tight">{cat.label}</span>
                  <span className="text-[9px] font-semibold text-slate-300 mt-0.5">{cat.count}</span>
                </Link>
              );
            })}
          </div>

          {/* ── 4. Live Mechanical Rolling Number Ticker Telemetry ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-9 pt-7 border-t border-slate-800/80 max-w-3xl mx-auto">
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
