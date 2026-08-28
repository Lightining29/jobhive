import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBolt,
  FaCircleCheck,
  FaCode,
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaLayerGroup,
  FaPhone,
  FaRocket,
  FaServer,
  FaStar,
} from 'react-icons/fa6';
import { MANISH_KUMAR_PROFILE } from '../../data/manishKumarProfile';
import SEOHead from '../../components/seo/SEOHead';

export const ManishKumarProjectsPage = () => {
  const profile = MANISH_KUMAR_PROFILE;

  const jsonLdSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://jobworkplace.com/manish-kumar/projects#page',
        'name': 'Manish Kumar: Enterprise Project Case Studies & Software Engineering Portfolio',
        'description': 'In-depth case studies of enterprise systems built by Manish Kumar: Job Workplace, ProgrammingWala, Afsha Enterprises, and Rancom Technologies.',
        'author': {
          '@type': 'Person',
          'name': 'Manish Kumar',
          'url': 'https://jobworkplace.com/manish-kumar',
        },
        'inLanguage': 'en-US',
        'image': 'https://jobworkplace.com/assets/manish-kumar-profile.svg',
        'mainEntityOfPage': 'https://jobworkplace.com/manish-kumar/projects',
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://jobworkplace.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Manish Kumar', 'item': 'https://jobworkplace.com/manish-kumar' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Projects & Case Studies', 'item': 'https://jobworkplace.com/manish-kumar/projects' },
        ],
      },
    ],
  }), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SEOHead
        title="Manish Kumar Projects | Full Stack & Cloud Case Studies Portfolio"
        description="Explore the software systems and web platforms engineered by Manish Kumar. Case studies of Job Workplace (JobHive), ProgrammingWala (LMS), Afsha Enterprises, and Rancom Technologies."
        keywords={[
          'Manish Kumar Projects',
          'ProgrammingWala Project Case Study',
          'Job Workplace Architecture',
          'Full Stack Web Applications Ghaziabad',
          'Manish Kumar Portfolio',
        ]}
        canonicalUrl="https://jobworkplace.com/manish-kumar/projects"
        ogImage="/assets/manish-kumar-profile.svg"
        schema={jsonLdSchema}
      />

      <section className="pt-14 pb-16 md:pt-18 md:pb-20 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-purple-500/15 via-slate-50 to-slate-50 dark:from-purple-950/30 dark:via-[#030712] dark:to-[#030712]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/manish-kumar" className="hover:underline">Manish Kumar</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">Projects & Case Studies</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-400/20 text-purple-900 dark:text-purple-300 border border-purple-400/40 mb-4">
            <FaRocket className="h-3.5 w-3.5 text-purple-500" />
            <span>Production Systems Portfolio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Enterprise Projects & Software Case Studies
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 leading-relaxed font-medium">
            Architectural breakdowns, technologies used, scalability challenges, and measurable results for systems built by Manish Kumar.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        {profile.featuredProjects.map((proj, idx) => (
          <article
            key={idx}
            className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-lg space-y-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                {proj.category}
              </span>
              <span className="text-xs font-bold text-slate-400">Case Study #{idx + 1}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {proj.title}
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {proj.description}
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Technologies & Tools:
              </h4>
              <div className="flex flex-wrap gap-2">
                {proj.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-cyan-300 border border-slate-200 dark:border-slate-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {proj.url && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !py-2 !px-5 text-xs font-bold inline-flex items-center gap-2"
                >
                  <FaGlobe className="h-3.5 w-3.5" />
                  View Live Platform ({proj.url}) →
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default ManishKumarProjectsPage;
