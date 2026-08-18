import { FaXmark, FaGithub, FaArrowUpRightFromSquare, FaCheck, FaLayerGroup } from 'react-icons/fa6';

export const ProjectDetailModal = ({ project, onClose, isDark = true }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl rounded-[28px] p-6 sm:p-8 overflow-hidden shadow-2xl transition-all my-8 ${
          isDark
            ? 'bg-[#060c1d] border-2 border-[#00f0ff] shadow-[0_0_40px_rgba(0,240,255,0.4)] text-white'
            : 'bg-white border border-slate-200 shadow-2xl text-slate-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 h-9 w-9 rounded-full flex items-center justify-center transition-all ${
            isDark
              ? 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <FaXmark className="h-4 w-4" />
        </button>

        {project.imageUrl && (
          <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 bg-slate-950 border border-slate-800">
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
            isDark ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30' : 'bg-slate-100 text-slate-800'
          }`}>
            Featured Project
          </span>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black mb-3 ${isDark ? 'text-white drop-shadow-sm' : 'text-slate-900'}`}>
          {project.title}
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {project.description}
        </p>

        {/* Problem & Solution Grid */}
        {(project.problem || project.solution) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {project.problem && (
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-900/60 border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-xs font-black uppercase tracking-wider text-amber-500 mb-1">Challenge / Problem</p>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{project.problem}</p>
              </div>
            )}
            {project.solution && (
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-900/60 border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">Engineering Solution</p>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{project.solution}</p>
              </div>
            )}
          </div>
        )}

        {/* Key Features */}
        {project.features && project.features.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">Key Highlights & Architecture</h4>
            <ul className="space-y-2">
              {project.features.map((f, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FaCheck className="h-2.5 w-2.5" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech Stack */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FaLayerGroup className="h-3 w-3 text-cyan-400" /> Technology Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t, i) => (
                <span
                  key={i}
                  className={`text-xs font-bold px-3 py-1 rounded-xl ${
                    isDark
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Links */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:scale-105 shadow-[0_0_15px_rgba(0,240,255,0.6)] transition-all"
            >
              <FaArrowUpRightFromSquare className="h-3.5 w-3.5" /> Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                isDark
                  ? 'bg-slate-900/80 text-white border-slate-700 hover:border-cyan-400'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <FaGithub className="h-4 w-4" /> Source Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
