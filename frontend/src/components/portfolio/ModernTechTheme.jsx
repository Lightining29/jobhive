import React, { useState } from 'react';
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaGlobe,
  FaFileArrowDown,
  FaArrowRight,
  FaStar,
  FaCheck,
  FaCode,
  FaBriefcase,
  FaGraduationCap,
  FaAward,
  FaRocket,
  FaTerminal,
  FaQuoteLeft,
  FaBolt,
  FaArrowUpRightFromSquare,
  FaBars,
  FaXmark,
  FaLocationDot,
  FaLayerGroup,
  FaServer,
  FaCloud,
  FaBrain,
  FaCertificate,
} from 'react-icons/fa6';
import { ProjectDetailModal } from './ProjectDetailModal';
import { formatAvatarUrl } from '../../utils/format';

const SERVICE_ICONS = {
  layout: FaLayerGroup,
  server: FaServer,
  cloud: FaCloud,
  brain: FaBrain,
  code: FaCode,
};

export const ModernTechTheme = ({ portfolio = {}, isPreview = false }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [contactSent, setContactSent] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactMsg, setContactMsg] = useState({ name: '', email: '', message: '' });

  const hero = portfolio?.hero || {};
  const about = portfolio?.about || {};
  const skills = portfolio?.skills?.categories || [];
  const experience = portfolio?.experience || [];
  const projects = portfolio?.projects || [];
  const education = portfolio?.education || [];
  const certifications = portfolio?.certifications || [];
  const achievements = portfolio?.achievements || [];
  const services = portfolio?.services || [];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (hero.email) {
      window.location.href = `mailto:${hero.email}?subject=Opportunity Inquiry from ${encodeURIComponent(contactMsg.name)}&body=${encodeURIComponent(contactMsg.message + '\n\nFrom: ' + contactMsg.name + ' (' + contactMsg.email + ')')}`;
    }
    setContactSent(true);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden w-full max-w-full">
      {/* Ambient Cyber Neon Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff07_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff07_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,240,255,0.08)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <a href="#hero" className="flex items-center gap-2.5 group shrink-0 min-w-0">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-black flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(0,240,255,0.7)] group-hover:scale-110 transition-transform shrink-0">
              &lt;/&gt;
            </span>
            <span className="font-black text-sm sm:text-base text-white tracking-tight group-hover:text-cyan-400 transition-colors truncate">
              {hero.name || 'Developer'}
            </span>
          </a>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
            {about.summary && <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>}
            {skills.length > 0 && <a href="#skills" className="hover:text-cyan-400 transition-colors">Skills</a>}
            {experience.length > 0 && <a href="#experience" className="hover:text-cyan-400 transition-colors">Experience</a>}
            {projects.length > 0 && <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>}
            {services.length > 0 && <a href="#services" className="hover:text-cyan-400 transition-colors">Services</a>}
            <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {hero.showResume && hero.resumeUrl && (
              <a
                href={hero.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
              >
                <FaFileArrowDown className="h-3 w-3 text-cyan-400" /> Resume
              </a>
            )}
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)] hover:scale-105 transition-all"
            >
              Hire Me <FaArrowRight className="h-2.5 w-2.5" />
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaXmark className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cyan-500/20 bg-[#030712]/95 backdrop-blur-2xl px-6 py-4 space-y-3">
            {about.summary && <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-200 hover:text-cyan-400">About</a>}
            {skills.length > 0 && <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-200 hover:text-cyan-400">Skills</a>}
            {experience.length > 0 && <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-200 hover:text-cyan-400">Experience</a>}
            {projects.length > 0 && <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-200 hover:text-cyan-400">Projects</a>}
            {services.length > 0 && <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-200 hover:text-cyan-400">Services</a>}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-slate-200 hover:text-cyan-400">Contact</a>
          </div>
        )}
      </header>

      {/* Main Content Sections */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-24">
        
        {/* ── 1. HERO SECTION ── */}
        <section id="hero" className="pt-4 sm:pt-10 flex flex-col-reverse lg:flex-row items-center justify-between gap-8 sm:gap-14 w-full max-w-full overflow-hidden">
          <div className="flex-1 text-center lg:text-left min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-5 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <FaTerminal className="h-3 w-3 text-cyan-400" />
              <span>&lt;developer.portfolio active /&gt;</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white break-words">
              Hi, I'm <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                {hero.name || 'Software Engineer'}
              </span>
            </h1>

            <p className="text-base sm:text-xl font-bold text-cyan-400/90 mt-3 flex items-center justify-center lg:justify-start gap-2">
              <span>✦</span> {hero.title || 'Full Stack Developer'}
            </p>

            <p className="text-xs sm:text-base text-slate-300 mt-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {hero.tagline || hero.bioShort || 'Building scalable, user-focused digital solutions with modern technologies and clean architecture.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mt-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_20px_rgba(0,240,255,0.7)] hover:scale-105 transition-all cursor-pointer"
              >
                <FaRocket className="h-4 w-4" /> {hero.ctaHire || 'Hire Me'}
              </a>

              {projects.length > 0 && (
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900/80 border border-slate-700 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
                >
                  <FaCode className="h-4 w-4 text-cyan-400" /> {hero.ctaWork || 'View My Work'}
                </a>
              )}

              {hero.showResume && hero.resumeUrl && (
                <a
                  href={hero.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-300 bg-slate-900/50 border border-slate-800 hover:border-slate-600 hover:text-white transition-all"
                >
                  <FaFileArrowDown className="h-4 w-4 text-amber-400" /> Resume
                </a>
              )}
            </div>

            {/* Social & Location Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 pt-6 border-t border-slate-800 text-xs font-semibold text-slate-400">
              {hero.location && (
                <span className="flex items-center gap-1.5 text-slate-300">
                  <FaLocationDot className="h-3 w-3 text-cyan-400" /> {hero.location}
                </span>
              )}
              {hero.github && (
                <a href={hero.github.startsWith('http') ? hero.github : `https://${hero.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors">
                  <FaGithub className="h-3.5 w-3.5" /> GitHub
                </a>
              )}
              {hero.linkedin && (
                <a href={hero.linkedin.startsWith('http') ? hero.linkedin : `https://${hero.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors">
                  <FaLinkedin className="h-3.5 w-3.5 text-sky-400" /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Profile Photo with Big Circular Radiant Neon Ring */}
          <div className="relative shrink-0 flex items-center justify-center my-4 lg:my-0">
            <div className="relative h-44 w-44 sm:h-64 sm:w-64 lg:h-72 lg:w-72 rounded-full p-2 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_45px_rgba(0,240,255,0.65)]">
              <div className="h-full w-full rounded-full overflow-hidden bg-[#070e24] flex items-center justify-center border-2 border-cyan-400/50">
                {hero.avatar ? (
                  <img
                    src={formatAvatarUrl(hero.avatar)}
                    alt={hero.name || ''}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`text-5xl sm:text-7xl lg:text-8xl font-black text-cyan-400 drop-shadow-[0_0_20px_#00f0ff] ${hero.avatar ? 'hidden' : 'flex'}`}>
                  {hero.name ? hero.name.charAt(0).toUpperCase() : 'D'}
                </span>
              </div>
            </div>

            {/* Floating Experience Badge */}
            {about.experienceYears > 0 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 px-3.5 py-1.5 rounded-full bg-[#040816] border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.8)] flex items-center gap-1.5 text-xs font-black text-white shrink-0 whitespace-nowrap">
                <FaBolt className="h-3.5 w-3.5 text-amber-400" />
                <span>{about.experienceYears}+ YRS EXP</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 2. ABOUT ME SECTION ── */}
        {about.summary && (
          <section id="about" className="pt-8">
            <div className="p-8 sm:p-10 rounded-[32px] bg-[#040816]/90 border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">01 / ABOUT ME</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">
                Engineering with purpose, precision & speed
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                {about.summary}
              </p>

              {about.highlights && about.highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800">
                  {about.highlights.map((h, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                      <span className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FaCheck className="h-3 w-3" />
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{h}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 3. SKILLS SECTION (CATEGORIZED) ── */}
        {skills.length > 0 && (
          <section id="skills" className="pt-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">02 / CAPABILITIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">
              Technical Stack & Specialties
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-[24px] bg-[#040816]/90 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300"
                >
                  <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                    {cat.name}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-cyan-400 hover:text-white transition-all shadow-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. WORK EXPERIENCE TIMELINE ── */}
        {experience.length > 0 && (
          <section id="experience" className="pt-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">03 / EXPERIENCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">
              Career Journey & Impact
            </h2>

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-[28px] bg-[#040816]/90 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-lg relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl font-black text-white">{exp.role}</h3>
                      <p className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 mt-0.5">
                        <FaBriefcase className="h-3 w-3" /> {exp.company}
                        {exp.location && <span className="text-slate-500 font-normal">• {exp.location}</span>}
                      </p>
                    </div>

                    <span className="inline-flex items-center text-xs font-black px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 w-fit">
                      {exp.duration}
                    </span>
                  </div>

                  {exp.description && (
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed">{exp.description}</p>
                  )}

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="space-y-2 mt-4">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_#00f0ff]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. FEATURED PROJECTS SECTION ── */}
        {projects.length > 0 && (
          <section id="projects" className="pt-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">04 / PROJECTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">
              Engineered Works & Applications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-[28px] bg-[#040816]/90 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => setSelectedProject(proj)}
                >
                  <div>
                    {proj.imageUrl && (
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-5 bg-slate-950 border border-slate-800">
                        <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
                        {proj.title}
                      </h3>
                      <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                        Details →
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4">
                      {proj.description}
                    </p>
                  </div>

                  <div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.technologies.slice(0, 4).map((t, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                        >
                          <FaArrowUpRightFromSquare className="h-3 w-3" /> Live Demo
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white"
                        >
                          <FaGithub className="h-3 w-3" /> Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. SERVICES / WHAT I DO ── */}
        {services.length > 0 && (
          <section id="services" className="pt-8">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">05 / SERVICES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">
              Services & Core Deliverables
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {services.map((srv, idx) => {
                const IconComp = SERVICE_ICONS[srv.icon] || FaCode;
                return (
                  <div key={idx} className="p-6 rounded-[24px] bg-[#040816]/90 border border-slate-800 hover:border-cyan-400 transition-all">
                    <span className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 flex items-center justify-center mb-4">
                      <IconComp className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-black text-white mb-2">{srv.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{srv.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 7. EDUCATION & CERTIFICATIONS ── */}
        {(education.length > 0 || certifications.length > 0) && (
          <section className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {education.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <FaGraduationCap className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-lg font-black text-white">Education</h3>
                </div>
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#040816]/90 border border-slate-800">
                      <h4 className="text-base font-bold text-white">{edu.degree}</h4>
                      <p className="text-xs text-cyan-400 font-medium">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</p>
                      {(edu.startYear || edu.endYear) && (
                        <p className="text-[11px] text-slate-500 mt-1">{edu.startYear} - {edu.endYear || 'Present'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <FaCertificate className="h-4 w-4 text-amber-400" />
                  <h3 className="text-lg font-black text-white">Certifications</h3>
                </div>
                <div className="space-y-4">
                  {certifications.map((c, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#040816]/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white">{c.name}</h4>
                        <p className="text-xs text-slate-400">{c.issuer} {c.year ? `• ${c.year}` : ''}</p>
                      </div>
                      {c.verificationUrl && (
                        <a href={c.verificationUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-cyan-400 hover:underline">
                          Verify
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── 8. CONTACT SECTION ── */}
        <section id="contact" className="pt-8">
          <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-br from-[#060e24] via-[#040816] to-[#02050f] border-2 border-[#00f0ff] shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            <div className="max-w-2xl mx-auto text-center">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">GET IN TOUCH</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4">
                Let's build something meaningful together
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mb-8">
                Available for full-time opportunities, engineering contracts, and collaborative software projects.
              </p>

              {contactSent ? (
                <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-sm">
                  ✓ Message drafted! If your email client didn't open automatically, reach out directly at <span className="text-white underline">{hero.email}</span>.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Your Name"
                      value={contactMsg.name}
                      onChange={(e) => setContactMsg({ ...contactMsg, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none text-sm"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Your Email"
                      value={contactMsg.email}
                      onChange={(e) => setContactMsg({ ...contactMsg, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none text-sm"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell me about your project or role..."
                    value={contactMsg.message}
                    onChange={(e) => setContactMsg({ ...contactMsg, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all cursor-pointer"
                  >
                    Send Direct Message →
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© {new Date().getFullYear()} {hero.name || 'Developer'}. Built & hosted on Job Workplace.</p>
      </footer>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isDark={true}
        />
      )}
    </div>
  );
};
