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

export const CleanLightTheme = ({ portfolio, isPreview = false }) => {
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

  const rawSkills = skills || [];
  const normalizedSkills = Array.isArray(rawSkills) && rawSkills.length
    ? (typeof rawSkills[0] === 'string' ? [{ name: 'Technical Stack & Specialties', skills: rawSkills }] : rawSkills)
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-950 relative overflow-x-hidden">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-blue-100/60 blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-slate-200/50 blur-[150px]" />
      </div>

      {/* Sticky Clean Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <a href="#hero" className="flex items-center gap-2 group shrink-0 min-w-0">
            <span className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform shrink-0">
              ⚡
            </span>
            <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate">
              {hero.name || 'Developer'}
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-700">
            {about.summary && <a href="#about" className="hover:text-blue-600 transition-colors">About</a>}
            {normalizedSkills.length > 0 && <a href="#skills" className="hover:text-blue-600 transition-colors">Skills</a>}
            {experience.length > 0 && <a href="#experience" className="hover:text-blue-600 transition-colors">Experience</a>}
            {projects.length > 0 && <a href="#projects" className="hover:text-blue-600 transition-colors">Projects</a>}
            {services.length > 0 && <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>}
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {hero.showResume && hero.resumeUrl && (
              <a
                href={hero.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-all shadow-xs"
              >
                <FaFileArrowDown className="h-3 w-3 text-blue-600" /> Resume
              </a>
            )}
            <a
              href="#contact"
              className="inline-flex items-center px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all"
            >
              Get in Touch
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaXmark className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden px-6 py-4 bg-white/95 backdrop-blur-2xl border-b border-slate-200 space-y-3 text-xs font-bold uppercase tracking-wider">
            {about.summary && <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-800 hover:text-blue-600">About</a>}
            {normalizedSkills.length > 0 && <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-800 hover:text-blue-600">Skills</a>}
            {experience.length > 0 && <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-800 hover:text-blue-600">Experience</a>}
            {projects.length > 0 && <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-800 hover:text-blue-600">Projects</a>}
            {services.length > 0 && <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-800 hover:text-blue-600">Services</a>}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-800 hover:text-blue-600">Contact</a>
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10 space-y-20 sm:space-y-24 w-full max-w-full overflow-hidden">
        
        {/* ── 1. HERO SECTION ── */}
        <section id="hero" className="flex flex-col-reverse lg:flex-row items-center justify-between gap-6 sm:gap-12 pt-2 w-full max-w-full overflow-hidden">
          <div className="flex-1 text-center lg:text-left space-y-4 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>{hero.title || 'Software Engineer'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              <span className="block sm:inline">Hi, I'm </span>
              <span className="inline-block text-blue-600">{hero.name}</span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {hero.tagline || hero.bioShort || 'Building scalable applications and high-impact digital experiences.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:scale-105 transition-all"
              >
                <FaRocket className="h-3.5 w-3.5" /> {hero.ctaHire || 'Hire Me'}
              </a>

              {projects.length > 0 && (
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-all"
                >
                  <FaCode className="h-3.5 w-3.5 text-blue-600" /> {hero.ctaWork || 'View My Work'}
                </a>
              )}
            </div>

            {/* Social & Location Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mt-6 pt-5 border-t border-slate-200 text-xs font-semibold text-slate-500">
              {hero.location && (
                <span className="flex items-center gap-1.5 text-slate-700">
                  <FaLocationDot className="h-3 w-3 text-blue-600" /> {hero.location}
                </span>
              )}
              {hero.github && (
                <a href={hero.github.startsWith('http') ? hero.github : `https://${hero.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors">
                  <FaGithub className="h-3.5 w-3.5" /> GitHub
                </a>
              )}
              {hero.linkedin && (
                <a href={hero.linkedin.startsWith('http') ? hero.linkedin : `https://${hero.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors">
                  <FaLinkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Profile Photo with Big Circular Slate Blue Ring */}
          <div className="relative shrink-0 flex items-center justify-center my-2 lg:my-0">
            <div className="relative h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64 rounded-full p-1.5 sm:p-2 bg-gradient-to-br from-blue-400 via-indigo-400 to-slate-400 shadow-xl">
              <div className="h-full w-full rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-slate-200">
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
                <span className={`text-4xl sm:text-6xl lg:text-7xl font-black text-blue-600 ${hero.avatar ? 'hidden' : 'flex'}`}>
                  {hero.name ? hero.name.charAt(0).toUpperCase() : 'D'}
                </span>
              </div>
            </div>

            {about.experienceYears > 0 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 px-3 py-1 rounded-full bg-slate-900 shadow-xs flex items-center gap-1.5 text-[11px] font-black text-white shrink-0 whitespace-nowrap">
                <FaBolt className="h-3 w-3 text-amber-400" />
                <span>{about.experienceYears}+ YRS EXP</span>
              </div>
            )}
          </div>
        </section>

        {/* ── 2. ABOUT ME SECTION ── */}
        {about.summary && (
          <section id="about" className="pt-4 sm:pt-8">
            <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[32px] bg-white border border-slate-200 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">01 / ABOUT ME</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mb-4 sm:mb-6">
                Engineering reliable, scalable & modern solutions
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {about.summary}
              </p>

              {about.highlights?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 sm:mt-8 pt-6 border-t border-slate-100">
                  {about.highlights.map((h, i) => (
                    <div key={i} className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5">
                      <FaCheck className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 3. SKILLS SECTION ── */}
        {normalizedSkills.length > 0 && (
          <section id="skills" className="space-y-6 sm:space-y-8 pt-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">02 / COMPETENCIES</span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">Technical Stack & Specialties</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {normalizedSkills.map((category, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all"
                >
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(category.skills || []).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
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
          <section id="projects" className="space-y-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">03 / PORTFOLIO</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">Featured Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer rounded-[28px] bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-500 transition-all flex flex-col justify-between"
                >
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 uppercase">PROJECT 0{idx + 1}</span>
                      <FaArrowUpRightFromSquare className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.technologies?.slice(0, 4).map((tech, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl.startsWith('http') ? project.liveUrl : `https://${project.liveUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                        >
                          <FaArrowUpRightFromSquare className="h-3 w-3" /> Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 transition-all"
                        >
                          <FaGithub className="h-3 w-3" /> GitHub
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>View Case Study</span>
                    <FaArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. WORK EXPERIENCE TIMELINE ── */}
        {experience.length > 0 && (
          <section id="experience" className="space-y-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">04 / TRACK RECORD</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">Work History</h2>
            </div>

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-[28px] bg-white border border-slate-200 shadow-xs relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">{exp.role}</h3>
                      <p className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                    </div>
                    <span className="inline-flex self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
                      {exp.duration}
                    </span>
                  </div>

                  {exp.bullets?.length > 0 ? (
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-600">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. SERVICES OFFERED ── */}
        {services.length > 0 && (
          <section id="services" className="space-y-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">05 / SERVICES</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">What I Deliver</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((svc, idx) => {
                const Icon = SERVICE_ICONS[svc.icon] || FaCode;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all space-y-3"
                  >
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">{svc.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{svc.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 7. EDUCATION & CERTIFICATIONS ── */}
        {(education.length > 0 || certifications.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {education.length > 0 && (
              <div className="p-7 rounded-[28px] bg-white border border-slate-200 shadow-xs space-y-5">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FaGraduationCap className="h-5 w-5 text-blue-600" /> Education
                </h3>
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-blue-500 pl-4 py-1">
                      <p className="text-sm font-black text-slate-900">{edu.degree}</p>
                      <p className="text-xs text-blue-600 font-bold">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</p>
                      {edu.endYear && <p className="text-[11px] text-slate-400 mt-0.5">{edu.startYear ? `${edu.startYear} - ` : ''}{edu.endYear}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="p-7 rounded-[28px] bg-white border border-slate-200 shadow-xs space-y-5">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FaAward className="h-5 w-5 text-amber-500" /> Certifications
                </h3>
                <div className="space-y-4">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="border-l-2 border-amber-400 pl-4 py-1">
                      <p className="text-sm font-black text-slate-900">{cert.name}</p>
                      <p className="text-xs text-amber-600 font-bold">{cert.issuer} {cert.year ? `• ${cert.year}` : ''}</p>
                      {cert.verificationUrl && (
                        <a href={cert.verificationUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                          Verify Credential <FaArrowUpRightFromSquare className="h-2.5 w-2.5" />
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
          <div className="p-8 sm:p-12 rounded-[32px] bg-white border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">GET IN TOUCH</span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900">Let's Connect</h2>
              <p className="text-sm text-slate-600">
                Interested in working together or discussing an engineering opportunity? Reach out directly.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="max-w-xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={contactMsg.name}
                  onChange={(e) => setContactMsg({ ...contactMsg, name: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-900"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={contactMsg.email}
                  onChange={(e) => setContactMsg({ ...contactMsg, email: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <textarea
                rows={4}
                required
                placeholder="Your Message or Project Details..."
                value={contactMsg.message}
                onChange={(e) => setContactMsg({ ...contactMsg, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FaEnvelope className="h-4 w-4" /> Send Direct Inquiry
              </button>
              {contactSent && (
                <p className="text-center text-xs font-bold text-emerald-600 mt-2">Opening email client with your inquiry...</p>
              )}
            </form>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {hero.name || 'Developer'} • Generated with JobHive AI</p>
      </footer>

      {/* Project Case Study Modal */}
      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} isDark={false} />
      )}
    </div>
  );
};
