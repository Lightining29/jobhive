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
  FaBriefcase,
  FaGraduationCap,
  FaCertificate,
  FaAward,
  FaLayerGroup,
  FaServer,
  FaCloud,
  FaBrain,
  FaCode,
  FaCheck,
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

export const ExecutiveTheme = ({ portfolio, isPreview = false }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [contactSent, setContactSent] = useState(false);
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
      window.location.href = `mailto:${hero.email}?subject=Executive Inquiry from ${encodeURIComponent(contactMsg.name)}&body=${encodeURIComponent(contactMsg.message + '\n\nFrom: ' + contactMsg.name + ' (' + contactMsg.email + ')')}`;
    }
    setContactSent(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans selection:bg-slate-900 selection:text-white">
      {/* Executive Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-black text-slate-900 tracking-tight">
              {hero.name || 'Executive Profile'}
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              {hero.title || 'Professional Portfolio'}
            </p>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-slate-600">
            {about.summary && <a href="#about" className="hover:text-slate-950 transition-colors">Overview</a>}
            {experience.length > 0 && <a href="#experience" className="hover:text-slate-950 transition-colors">Experience</a>}
            {projects.length > 0 && <a href="#projects" className="hover:text-slate-950 transition-colors">Projects</a>}
            {skills.length > 0 && <a href="#skills" className="hover:text-slate-950 transition-colors">Competencies</a>}
            <a href="#contact" className="hover:text-slate-950 transition-colors">Inquire</a>
          </nav>

          <div className="flex items-center gap-3">
            {hero.showResume && hero.resumeUrl && (
              <a
                href={hero.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 transition-all"
              >
                <FaFileArrowDown className="h-3 w-3 text-slate-600" /> CV
              </a>
            )}
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-black bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-sm"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">

        {/* ── 1. HERO / EXECUTIVE SUMMARY ── */}
        <section id="hero" className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 pt-4">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-widest mb-4">
              Verified Candidate Portfolio
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl font-black text-slate-950 leading-tight">
              {hero.name || 'Professional Candidate'}
            </h2>

            <p className="text-lg font-bold text-slate-600 mt-2">
              {hero.title || 'Senior Software Engineer'}
            </p>

            <p className="text-base text-slate-600 mt-5 leading-relaxed max-w-xl mx-auto md:mx-0">
              {hero.tagline || hero.bioShort || 'Driving enterprise digital strategy and building scalable, user-centric software architectures.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-slate-950 hover:bg-slate-800 transition-all shadow-md"
              >
                {hero.ctaHire || 'Contact Executive'} <FaArrowRight className="h-3 w-3" />
              </a>

              {projects.length > 0 && (
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
                >
                  {hero.ctaWork || 'Selected Works'}
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8 pt-6 border-t border-slate-200 text-xs font-semibold text-slate-500">
              {hero.location && (
                <span className="flex items-center gap-1.5 text-slate-700">
                  <FaLocationDot className="h-3 w-3 text-slate-400" /> {hero.location}
                </span>
              )}
              {hero.linkedin && (
                <a href={hero.linkedin.startsWith('http') ? hero.linkedin : `https://${hero.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950">
                  <FaLinkedin className="h-3.5 w-3.5 text-blue-700" /> LinkedIn Profile
                </a>
              )}
              {hero.github && (
                <a href={hero.github.startsWith('http') ? hero.github : `https://${hero.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950">
                  <FaGithub className="h-3.5 w-3.5" /> GitHub Repositories
                </a>
              )}
            </div>
          </div>

          {/* Portrait Photo */}
          <div className="relative shrink-0">
            <div className="h-52 w-52 sm:h-64 sm:w-64 rounded-2xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center">
              {hero.avatar ? (
                <img
                  src={formatAvatarUrl(hero.avatar)}
                  alt={hero.name || ''}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={`font-serif text-6xl font-black text-slate-400 ${hero.avatar ? 'hidden' : 'flex'}`}>
                {hero.name ? hero.name.charAt(0).toUpperCase() : 'E'}
              </span>
            </div>
          </div>
        </section>

        {/* ── 2. EXECUTIVE STATEMENT & HIGHLIGHTS ── */}
        {about.summary && (
          <section id="about" className="pt-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs uppercase tracking-widest font-black text-slate-400">Executive Summary</span>
              <p className="font-serif text-xl sm:text-2xl text-slate-900 mt-4 leading-relaxed">
                "{about.summary}"
              </p>

              {about.highlights && about.highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-100">
                  {about.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                        <FaCheck className="h-2.5 w-2.5" />
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{h}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 3. CAREER TIMELINE / EXPERIENCE ── */}
        {experience.length > 0 && (
          <section id="experience" className="pt-8">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest font-black text-slate-400">Professional Background</span>
              <h3 className="font-serif text-3xl font-black text-slate-900 mt-1">Career Record & Engagements</h3>
            </div>

            <div className="relative border-l-2 border-slate-200 pl-6 sm:pl-8 space-y-10 ml-3">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative group">
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-950 border-4 border-white shadow-sm" />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                    <h4 className="text-lg font-black text-slate-900">{exp.role}</h4>
                    <span className="text-xs font-bold text-slate-500">{exp.duration}</span>
                  </div>

                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                    <span>{exp.company}</span>
                    {exp.location && <span className="text-slate-400 font-normal">• {exp.location}</span>}
                  </p>

                  {exp.description && (
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{exp.description}</p>
                  )}

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="space-y-2 mt-2">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2.5 leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
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

        {/* ── 4. PROJECTS & CASE STUDIES ── */}
        {projects.length > 0 && (
          <section id="projects" className="pt-8">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest font-black text-slate-400">Portfolio of Work</span>
              <h3 className="font-serif text-3xl font-black text-slate-900 mt-1">Featured Systems & Case Studies</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedProject(proj)}
                  className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {proj.imageUrl && (
                      <div className="w-full h-44 rounded-xl overflow-hidden mb-6 bg-slate-100">
                        <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <h4 className="font-serif text-xl font-black text-slate-900 group-hover:text-slate-600 transition-colors mb-2">
                      {proj.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6">
                      {proj.description}
                    </p>
                  </div>

                  <div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold">
                      <span className="text-slate-900 group-hover:underline">Read Case Study →</span>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-500 hover:text-slate-900 flex items-center gap-1"
                        >
                          <FaArrowUpRightFromSquare className="h-3 w-3" /> Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. CORE COMPETENCIES ── */}
        {skills.length > 0 && (
          <section id="skills" className="pt-8">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-widest font-black text-slate-400">Capabilities</span>
              <h3 className="font-serif text-3xl font-black text-slate-900 mt-1">Core Competencies</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((cat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">{cat.name}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((s, sIdx) => (
                      <span key={sIdx} className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. EDUCATION & ACCREDITATIONS ── */}
        {(education.length > 0 || certifications.length > 0) && (
          <section className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-10">
            {education.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-4">Academic Background</h4>
                <div className="space-y-4">
                  {education.map((edu, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200">
                      <p className="font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</p>
                      {(edu.startYear || edu.endYear) && (
                        <p className="text-[11px] text-slate-400 mt-1">{edu.startYear} - {edu.endYear || 'Present'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-4">Certifications & Accreditations</h4>
                <div className="space-y-4">
                  {certifications.map((c, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-600">{c.issuer} {c.year ? `• ${c.year}` : ''}</p>
                      </div>
                      {c.verificationUrl && (
                        <a href={c.verificationUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-900 underline">
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

        {/* ── 7. CONTACT / INQUIRY ── */}
        <section id="contact" className="pt-8">
          <div className="p-10 sm:p-14 rounded-3xl bg-slate-950 text-white">
            <div className="max-w-2xl mx-auto text-center">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Direct Communication</span>
              <h3 className="font-serif text-3xl sm:text-4xl font-black mt-2 mb-4">
                Inquire & Initiate Collaboration
              </h3>
              <p className="text-sm text-slate-400 mb-8">
                Reach out regarding executive appointments, strategic advisement, or full-time senior engineering opportunities.
              </p>

              {contactSent ? (
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 text-sm font-bold">
                  ✓ Inquiry initiated. You can also write directly to <span className="underline">{hero.email}</span>.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Name"
                      value={contactMsg.name}
                      onChange={(e) => setContactMsg({ ...contactMsg, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:border-white focus:outline-none text-sm"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Business Email"
                      value={contactMsg.email}
                      onChange={(e) => setContactMsg({ ...contactMsg, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:border-white focus:outline-none text-sm"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Inquiry or brief description of role..."
                    value={contactMsg.message}
                    onChange={(e) => setContactMsg({ ...contactMsg, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:border-white focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                  >
                    Submit Executive Inquiry →
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} {hero.name || 'Candidate'}. Professional Executive Portfolio.</p>
      </footer>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isDark={false}
        />
      )}
    </div>
  );
};
