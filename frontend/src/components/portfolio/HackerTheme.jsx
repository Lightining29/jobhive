import { useState } from 'react';
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaFileArrowDown,
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaCode,
  FaTerminal,
  FaBriefcase,
  FaGraduationCap,
  FaAward,
  FaCertificate,
  FaLayerGroup,
  FaServer,
  FaCloud,
  FaBrain,
  FaBolt,
  FaCheck,
  FaRocket,
  FaBars,
  FaXmark,
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

export const HackerTheme = ({ portfolio, isPreview = false }) => {
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
    <div className="min-h-screen bg-[#020a04] text-emerald-100 font-mono selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Matrix CRT Scanline & Phosphor Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810d_1px,transparent_1px),linear-gradient(to_bottom,#10b9810d_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-30" />
      </div>

      {/* Terminal Command Header */}
      <header className="sticky top-0 z-40 bg-[#031006]/90 backdrop-blur-xl border-b border-emerald-500/30 shadow-[0_4px_30px_rgba(16,185,129,0.15)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2.5 group">
            <span className="h-8 w-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.7)] group-hover:scale-110 transition-transform">
              &gt;_
            </span>
            <span className="font-bold text-sm text-emerald-400 tracking-tight group-hover:text-emerald-300 transition-colors">
              root@{hero.name?.toLowerCase().replace(/\s+/g, '') || 'developer'}:~#
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-emerald-400/80">
            {about.summary && <a href="#about" className="hover:text-emerald-300 transition-colors hover:underline">/about</a>}
            {skills.length > 0 && <a href="#skills" className="hover:text-emerald-300 transition-colors hover:underline">/skills</a>}
            {experience.length > 0 && <a href="#experience" className="hover:text-emerald-300 transition-colors hover:underline">/history</a>}
            {projects.length > 0 && <a href="#projects" className="hover:text-emerald-300 transition-colors hover:underline">/projects</a>}
            {services.length > 0 && <a href="#services" className="hover:text-emerald-300 transition-colors hover:underline">/services</a>}
            <a href="#contact" className="hover:text-emerald-300 transition-colors hover:underline">/contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {hero.showResume && hero.resumeUrl && (
              <a
                href={hero.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#061c0b] border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              >
                <FaFileArrowDown className="h-3 w-3" /> cat resume.pdf
              </a>
            )}
            <a
              href="#contact"
              className="px-4 py-2 rounded-lg text-xs font-black bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.7)] hover:bg-emerald-400 transition-all"
            >
              $ ./connect
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-400"
            >
              {mobileMenuOpen ? <FaXmark className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-4 bg-[#041508] border-b border-emerald-500/40 space-y-2 text-xs font-bold">
            {about.summary && <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-emerald-300 hover:text-emerald-100">&gt; cd /about</a>}
            {skills.length > 0 && <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-emerald-300 hover:text-emerald-100">&gt; cd /skills</a>}
            {experience.length > 0 && <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-emerald-300 hover:text-emerald-100">&gt; cd /history</a>}
            {projects.length > 0 && <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-emerald-300 hover:text-emerald-100">&gt; cd /projects</a>}
            {services.length > 0 && <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-emerald-300 hover:text-emerald-100">&gt; cd /services</a>}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-emerald-300 hover:text-emerald-100">&gt; cd /contact</a>
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 space-y-24">
        
        {/* ── 1. HERO SECTION ── */}
        <section id="hero" className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 pt-4">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>STATUS: ONLINE &bull; {hero.title || 'SYSTEM ENGINEER'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              <span className="text-emerald-400 font-normal">&gt;</span> <span className="text-emerald-300 drop-shadow-[0_0_20px_#10b981]">{hero.name}</span>
              <span className="inline-block w-3 h-8 bg-emerald-400 ml-2 animate-pulse" />
            </h1>

            <p className="text-sm sm:text-base font-normal text-emerald-200/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              // {hero.tagline || hero.bioShort || 'Building scalable applications and high-impact digital experiences.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-black text-xs sm:text-sm text-black bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.7)] hover:bg-emerald-300 hover:scale-105 transition-all cursor-pointer"
              >
                <FaTerminal className="h-4 w-4" /> {hero.ctaHire || 'INITIATE_CONTACT'}
              </a>

              {projects.length > 0 && (
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs sm:text-sm text-emerald-300 bg-[#041909] border border-emerald-500/40 hover:border-emerald-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                >
                  <FaCode className="h-4 w-4 text-emerald-400" /> {hero.ctaWork || 'LS_PROJECTS'}
                </a>
              )}
            </div>

            {/* Social & Location Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 pt-6 border-t border-emerald-950 text-xs font-bold text-emerald-400/80">
              {hero.location && (
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <FaLocationDot className="h-3 w-3 text-emerald-400" /> LOC: {hero.location}
                </span>
              )}
              {hero.github && (
                <a href={hero.github.startsWith('http') ? hero.github : `https://${hero.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-100 transition-colors">
                  <FaGithub className="h-3.5 w-3.5" /> git/repo
                </a>
              )}
              {hero.linkedin && (
                <a href={hero.linkedin.startsWith('http') ? hero.linkedin : `https://${hero.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-100 transition-colors">
                  <FaLinkedin className="h-3.5 w-3.5" /> net/in
                </a>
              )}
            </div>
          </div>

          {/* Profile Photo Circular Terminal Box */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative h-56 w-56 sm:h-72 sm:w-72 rounded-full p-2 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 shadow-[0_0_45px_rgba(16,185,129,0.65)]">
              <div className="h-full w-full rounded-full overflow-hidden bg-[#020b05] flex items-center justify-center border-2 border-emerald-500/50">
                {hero.avatar ? (
                  <img
                    src={formatAvatarUrl(hero.avatar)}
                    alt={hero.name || ''}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover rounded-full grayscale contrast-125"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`text-6xl sm:text-8xl font-black text-emerald-400 drop-shadow-[0_0_20px_#10b981] ${hero.avatar ? 'hidden' : 'flex'}`}>
                  {hero.name ? hero.name.charAt(0).toUpperCase() : '01'}
                </span>
              </div>
            </div>

            {about.experienceYears > 0 && (
              <div className="absolute -bottom-2 -left-2 sm:bottom-2 sm:left-0 px-3.5 py-1.5 rounded-full bg-[#041a09] border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] flex items-center gap-2 text-xs font-black text-emerald-300">
                <FaBolt className="h-3 w-3 text-emerald-400" />
                <span>UPTIME: {about.experienceYears}Y</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 2. ABOUT ME SECTION ── */}
        {about.summary && (
          <section id="about" className="pt-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#041408]/90 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)] relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">$ cat /proc/system/bio.txt</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                // SYSTEM PROFILE OVERVIEW
              </h2>

              <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed whitespace-pre-line">
                {about.summary}
              </p>

              {about.highlights?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-emerald-950">
                  {about.highlights.map((h, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#020d05] border border-emerald-500/20 flex items-start gap-2 text-xs text-emerald-300">
                      <span className="text-emerald-400 font-bold">[✓]</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 3. SKILLS SECTION ── */}
        {skills.length > 0 && (
          <section id="skills" className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">$ system --list-modules</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Installed Dependencies</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((category, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#041408]/90 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                >
                  <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="text-emerald-400">&gt;</span> {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#020b05] border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all"
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

        {/* ── 4. PROJECTS SECTION ── */}
        {projects.length > 0 && (
          <section id="projects" className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">$ ls -la /var/projects</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Compiled Binaries & Repos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer rounded-2xl bg-[#041408]/90 border border-emerald-500/30 overflow-hidden hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-emerald-400">
                      <span>./project_{idx + 1}.bin</span>
                      <FaArrowUpRightFromSquare className="h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-emerald-200/70 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.technologies?.slice(0, 4).map((tech, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] bg-[#020b05] text-emerald-400 border border-emerald-500/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl.startsWith('http') ? project.liveUrl : `https://${project.liveUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-black bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all"
                        >
                          <FaArrowUpRightFromSquare className="h-2.5 w-2.5" /> ./run_demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-emerald-400 bg-[#020b05] border border-emerald-500/40 hover:border-emerald-400 hover:text-white transition-all"
                        >
                          <FaGithub className="h-3 w-3" /> git_repo
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-2.5 bg-[#020d05] border-t border-emerald-950 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                    <span>EXECUTE_INSPECT()</span>
                    <FaArrowRight className="h-2.5 w-2.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. WORK EXPERIENCE TIMELINE ── */}
        {experience.length > 0 && (
          <section id="experience" className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">$ git log --oneline --history</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Commit Logs & Roles</h2>
            </div>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-[#041408]/90 border border-emerald-500/30 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-emerald-950">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">&gt; {exp.role}</h3>
                      <p className="text-xs text-emerald-400 mt-0.5">ORG: {exp.company} {exp.location ? `[${exp.location}]` : ''}</p>
                    </div>
                    <span className="inline-flex self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-bold bg-[#020d05] border border-emerald-500/30 text-emerald-300">
                      {exp.duration}
                    </span>
                  </div>

                  {exp.bullets?.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-emerald-200/80">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&gt;&gt;</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-200/80">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. SERVICES OFFERED ── */}
        {services.length > 0 && (
          <section id="services" className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">$ systemctl status services</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Running Daemons & Capabilities</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((svc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#041408]/90 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all space-y-2"
                >
                  <div className="text-emerald-400 text-xs font-black">
                    DAEMON 0{idx + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white">{svc.title}</h3>
                  <p className="text-xs text-emerald-200/70 leading-relaxed">{svc.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 7. EDUCATION & CERTIFICATIONS ── */}
        {(education.length > 0 || certifications.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#041408]/90 border border-emerald-500/30 space-y-4">
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <FaGraduationCap className="h-4 w-4 text-emerald-400" /> Academic Degrees
                </h3>
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-emerald-500/50 pl-3 py-1 text-xs">
                      <p className="font-bold text-white">{edu.degree}</p>
                      <p className="text-emerald-400">{edu.institution} {edu.fieldOfStudy ? `[${edu.fieldOfStudy}]` : ''}</p>
                      {edu.endYear && <p className="text-emerald-400/50 mt-0.5">{edu.startYear ? `${edu.startYear} - ` : ''}{edu.endYear}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#041408]/90 border border-emerald-500/30 space-y-4">
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <FaAward className="h-4 w-4 text-emerald-400" /> Verified Hashes & Certs
                </h3>
                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="border-l-2 border-emerald-500/50 pl-3 py-1 text-xs">
                      <p className="font-bold text-white">{cert.name}</p>
                      <p className="text-emerald-400">{cert.issuer} {cert.year ? `[${cert.year}]` : ''}</p>
                      {cert.verificationUrl && (
                        <a href={cert.verificationUrl} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5">
                          verify_signature() <FaArrowUpRightFromSquare className="h-2 w-2" />
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
        <section id="contact" className="pt-6">
          <div className="p-6 sm:p-10 rounded-2xl bg-[#031006] border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div className="max-w-2xl mx-auto text-center space-y-3 mb-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">$ netcat -v -l 8080</span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">OPEN RAW SOCKET</h2>
              <p className="text-xs text-emerald-200/70">
                Establish direct peer connection. Transmit opportunities and inquiry packets.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="max-w-xl mx-auto space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="sender_identity"
                  value={contactMsg.name}
                  onChange={(e) => setContactMsg({ ...contactMsg, name: e.target.value })}
                  className="px-3 py-2.5 rounded-lg bg-[#010703] border border-emerald-500/40 text-emerald-100 placeholder:text-emerald-400/40 text-xs focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="email"
                  required
                  placeholder="sender_email"
                  value={contactMsg.email}
                  onChange={(e) => setContactMsg({ ...contactMsg, email: e.target.value })}
                  className="px-3 py-2.5 rounded-lg bg-[#010703] border border-emerald-500/40 text-emerald-100 placeholder:text-emerald-400/40 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
              <textarea
                rows={4}
                required
                placeholder="payload_message_buffer..."
                value={contactMsg.message}
                onChange={(e) => setContactMsg({ ...contactMsg, message: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-[#010703] border border-emerald-500/40 text-emerald-100 placeholder:text-emerald-400/40 text-xs focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-black text-xs text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FaTerminal className="h-3.5 w-3.5" /> $ send_packet --urgent
              </button>
              {contactSent && (
                <p className="text-center text-xs font-bold text-emerald-400 mt-2">Packet delivered to mail client.</p>
              )}
            </form>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-emerald-950 text-center text-xs text-emerald-400/50">
        <p>[EOF] {new Date().getFullYear()} {hero.name || 'Developer'} • JobHive Engine</p>
      </footer>

      {/* Project Case Study Modal */}
      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
};
