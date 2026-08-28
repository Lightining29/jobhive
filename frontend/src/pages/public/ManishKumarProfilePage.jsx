import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaAward,
  FaBolt,
  FaBrain,
  FaBriefcase,
  FaBuilding,
  FaCertificate,
  FaChevronDown,
  FaChevronUp,
  FaCircleCheck,
  FaCode,
  FaCompass,
  FaEnvelope,
  FaFire,
  FaGithub,
  FaGlobe,
  FaGraduationCap,
  FaLayerGroup,
  FaLinkedin,
  FaLocationDot,
  FaPhone,
  FaRocket,
  FaServer,
  FaShieldHalved,
  FaStar,
  FaWhatsapp,
} from 'react-icons/fa6';
import { MANISH_KUMAR_PROFILE } from '../../data/manishKumarProfile';
import SEOHead from '../../components/seo/SEOHead';

export const ManishKumarProfilePage = () => {
  const profile = MANISH_KUMAR_PROFILE;
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // High-Authority Person & ProfilePage Schema for Google Knowledge Graph & AI Overviews
  const jsonLdSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': 'https://jobworkplace.com/manish-kumar#person',
          'name': profile.name,
          'alternateName': ['Manish Kumar Ghaziabad', 'Manish Kumar Java Developer', 'Manish Kumar ProgrammingWala', 'Lightining29'],
          'gender': profile.gender,
          'nationality': {
            '@type': 'Country',
            'name': 'India',
          },
          'jobTitle': profile.jobTitle,
          'description': profile.shortBio,
          'url': 'https://jobworkplace.com/manish-kumar',
          'image': 'https://jobworkplace.com/assets/manish-kumar-profile.svg',
          'sameAs': [
            'https://programmingwala.com/manish-kumar',
            'https://github.com/Lightining29',
            'https://programmingwala.com',
            'https://jobworkplace.com',
          ],
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': profile.location.city,
            'addressRegion': profile.location.state,
            'addressCountry': profile.location.country,
            'postalCode': profile.location.postalCode,
          },
          'alumniOf': {
            '@type': 'EducationalOrganization',
            'name': 'Bachelor of Technology (B.Tech) in Computer Science and Engineering',
          },
          'worksFor': profile.currentCompanies.map((c) => ({
            '@type': 'Organization',
            'name': c.name,
            'url': c.url || 'https://jobworkplace.com',
          })),
          'knowsAbout': [
            'Java Programming',
            'Core Java',
            'Spring Boot 3',
            'Microservices Architecture',
            'Hibernate / JPA',
            'AWS (Amazon Web Services)',
            'DevOps & CI/CD Pipelines',
            'Docker & Kubernetes',
            'React.js & Next.js',
            'Node.js & Express.js',
            'Full Stack Web Development',
            'Linux Server Administration',
            'MongoDB & PostgreSQL',
            'Technical Search Engine Optimization (SEO)',
          ],
          'telephone': profile.contact.phone,
          'email': profile.contact.email,
        },
        {
          '@type': 'ProfilePage',
          '@id': 'https://jobworkplace.com/manish-kumar',
          'url': 'https://jobworkplace.com/manish-kumar',
          'name': `${profile.name} | Best Java Full Stack Developer & AWS DevOps Engineer in Ghaziabad, India`,
          'description': profile.shortBio,
          'primaryImageOfPage': {
            '@type': 'ImageObject',
            'url': 'https://jobworkplace.com/assets/manish-kumar-profile.svg',
            'width': 1200,
            'height': 630,
          },
          'image': {
            '@type': 'ImageObject',
            'url': 'https://jobworkplace.com/assets/manish-kumar-profile.svg',
            'width': 1200,
            'height': 630,
          },
          'mainEntity': {
            '@id': 'https://jobworkplace.com/manish-kumar#person',
          },
          'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://jobworkplace.com/',
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Manish Kumar Profile',
                'item': 'https://jobworkplace.com/manish-kumar',
              },
            ],
          },
        },
        {
          '@type': 'FAQPage',
          'mainEntity': profile.faqs.map((faq) => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': faq.answer,
            },
          })),
        },
      ],
    };
  }, [profile]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SEOHead
        title="Manish Kumar | Best Java Full Stack Developer & AWS DevOps Engineer in Ghaziabad, India"
        description="Official professional profile of Manish Kumar, lead Java Full Stack Developer, AWS DevOps Solution Architect, and Creator of ProgrammingWala & Job Workplace in Ghaziabad, Delhi NCR, India."
        keywords={[
          'Manish Kumar',
          'Manish Kumar Java Developer',
          'Manish Kumar AWS DevOps Engineer',
          'Manish Kumar Ghaziabad',
          'Manish Kumar ProgrammingWala',
          'Java Full Stack Developer in Ghaziabad',
          'AWS DevOps Engineer in Delhi NCR',
          'Spring Boot Developer Noida',
          'Best Java Developer Ghaziabad',
          'Manish Kumar Appletree Infotech',
        ]}
        canonicalUrl="https://jobworkplace.com/manish-kumar"
        ogImage="/assets/manish-kumar-profile.svg"
        schema={jsonLdSchema}
      />

      {/* Hero Header with Cyberpunk Aura & Authority Badges */}
      <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-500/15 via-slate-50 to-slate-50 dark:from-cyan-950/30 dark:via-[#030712] dark:to-[#030712]">
        <div className="absolute top-12 left-1/3 w-96 h-96 bg-amber-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-amber-600 dark:hover:text-cyan-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">Manish Kumar Profile</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 shadow-xs">
                <FaBolt className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>Verified Authority Profile</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span>Ghaziabad & Delhi NCR, India</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Manish Kumar
              </h1>

              <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-cyan-400">
                Lead Java Full Stack Developer & AWS DevOps Solution Architect
              </p>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Architect and creator of high-throughput enterprise platforms including <strong>Job Workplace</strong> and <strong>ProgrammingWala</strong>. Specialized in high-performance Spring Boot 3 microservices, React.js / Next.js web applications, and resilient AWS Cloud DevOps infrastructure.
              </p>

              {/* Action Buttons & Quick Connect */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`mailto:${profile.contact.email}`}
                  className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-amber-400 text-slate-950 hover:bg-amber-300 dark:shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all flex items-center gap-2"
                >
                  <FaEnvelope className="h-4 w-4" />
                  Email Manish Kumar
                </a>

                <a
                  href={`https://wa.me/${profile.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-md"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  Chat on WhatsApp
                </a>

                <a
                  href={profile.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-slate-900 text-white dark:bg-slate-800 dark:text-white border border-slate-700 hover:border-amber-400 transition-all flex items-center gap-2"
                >
                  <FaGithub className="h-4 w-4" />
                  GitHub @Lightining29
                </a>
              </div>
            </div>

            {/* Quick Entity Card (Google AI Overviews & SGE Fast-Facts) */}
            <div className="w-full lg:w-96 shrink-0 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-2xl dark:shadow-[0_0_35px_rgba(0,240,255,0.15)] space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-cyan-500/20">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                  MK
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Manish Kumar</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ghaziabad, UP, India</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Primary Roles:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">Java Full Stack & AWS DevOps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Key Creations:</span>
                  <span className="font-bold text-amber-600 dark:text-cyan-400 text-right">ProgrammingWala, JobHive</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Education:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">B.Tech Computer Science</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Location:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">Ghaziabad, Delhi NCR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Direct Phone:</span>
                  <a href={`tel:${profile.contact.phone}`} className="font-bold text-slate-900 dark:text-slate-200 hover:underline">
                    {profile.contact.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Verified Email:</span>
                  <a href={`mailto:${profile.contact.email}`} className="font-bold text-slate-900 dark:text-slate-200 hover:underline">
                    {profile.contact.email}
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-cyan-500/20">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <FaCircleCheck className="h-3 w-3" /> Available for High-Impact Projects & Roles
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Page Navigation Links (Internal Link Architecture) */}
      <section className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center gap-4 text-xs font-black">
          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deep Dives:</span>
          <Link to="/manish-kumar/java-developer" className="hover:text-amber-600 dark:hover:text-cyan-300 transition-colors">
            ☕ Java Full Stack Expertise
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link to="/manish-kumar/aws-devops" className="hover:text-amber-600 dark:hover:text-cyan-300 transition-colors">
            ☁️ AWS & DevOps Architecture
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link to="/manish-kumar/projects" className="hover:text-amber-600 dark:hover:text-cyan-300 transition-colors">
            🚀 Featured Projects & Case Studies
          </Link>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {/* 1. Google AI Overview & Knowledge Graph Facts (Optimized for NLP Parsing) */}
        <section className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300">
              <FaBrain className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                About Manish Kumar — Summary & Profile Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified background information, core achievements, and engineering capabilities
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              <strong>Manish Kumar</strong> is a seasoned <strong>Java Full Stack Developer</strong>, <strong>DevOps Solution Architect</strong>, and technology entrepreneur based in <strong>Ghaziabad, Uttar Pradesh, India</strong> (Delhi NCR). Holding a Bachelor of Technology (B.Tech) in Computer Science, he has delivered enterprise web systems, high-concurrency microservices, and automated cloud CI/CD pipelines.
            </p>
            <p>
              As the founder and developer of <strong>ProgrammingWala</strong> (<a href="https://programmingwala.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-cyan-400 font-bold hover:underline">programmingwala.com</a>), Manish built an ISO-certified learning management system (LMS) equipped with in-browser coding compilers and structured career roadmaps. Concurrently, he serves as the lead architect of <strong>Job Workplace</strong> (<a href="https://jobworkplace.com" className="text-amber-600 dark:text-cyan-400 font-bold hover:underline">jobworkplace.com</a>), an AI-driven career telemetry portal aggregating verified openings with instant ATS redirection.
            </p>
          </div>
        </section>

        {/* 2. Comprehensive Core Competencies */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Core Technical Competencies
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              End-to-end capabilities across backend architecture, cloud infrastructure, and interactive frontends
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md space-y-3">
              <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300 inline-block">
                <FaCode className="h-5 w-5" />
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Java & Microservices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Core Java, Advanced Java, Spring Boot 3, Spring Security, Spring Cloud, Hibernate/JPA, and REST microservices with low latency.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md space-y-3">
              <span className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300 inline-block">
                <FaServer className="h-5 w-5" />
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">AWS Cloud & DevOps</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                AWS EC2, S3, RDS, Lambda, VPC, Docker containerization, Kubernetes orchestration, Jenkins CI/CD, and Linux VPS hardening.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md space-y-3">
              <span className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/20 dark:text-purple-300 inline-block">
                <FaGlobe className="h-5 w-5" />
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Frontend Engineering</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                React.js, Next.js, TypeScript, Tailwind CSS, Redux Toolkit, Framer Motion, and mobile-responsive UI design systems.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md space-y-3">
              <span className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300 inline-block">
                <FaLayerGroup className="h-5 w-5" />
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Database & Scalability</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                MongoDB, PostgreSQL, MySQL, Redis memory caching, indexing, connection pooling, and high-volume transaction safety.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Detailed Technology Matrix */}
        <section className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-lg space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Technology Stack & Tools Mastery
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Production-tested languages, frameworks, cloud services, and developer workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Backend & Languages */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Backend & Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.techStack.backend.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Cloud & DevOps */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                AWS Cloud & DevOps Infrastructure
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.techStack.cloudDevOps.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Frontend & UI */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Frontend & UI Engineering
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.techStack.frontend.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Databases & Tools */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Databases & Developer Tooling
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...profile.techStack.databases, ...profile.techStack.tools].map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Featured Projects & Architecture Case Studies */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Featured Production Systems & Projects
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-world software architectures built, deployed, and scaled by Manish Kumar
              </p>
            </div>
            <Link
              to="/manish-kumar/projects"
              className="text-xs font-bold text-amber-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              All Project Case Studies →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {profile.featuredProjects.map((proj, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/30 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                    {proj.category}
                  </span>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {proj.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-cyan-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {proj.url && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-amber-600 dark:text-cyan-300 hover:underline inline-flex items-center gap-1.5"
                    >
                      Visit Live System ({proj.url}) →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. Google AI & SGE Frequently Asked Questions */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Direct factual answers regarding Manish Kumar's experience, technologies, and project availability
            </p>
          </div>

          <div className="space-y-3">
            {profile.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070e24] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                  className="w-full px-6 py-4 text-left font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  {openFaqIndex === idx ? (
                    <FaChevronUp className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <FaChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {openFaqIndex === idx && (
                  <div className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. Direct Contact & Engagement Box */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-[#070e24] to-slate-950 text-white border border-amber-400/30 dark:border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-5">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Connect Directly with Manish Kumar
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Looking for a lead Java Full Stack Developer, AWS DevOps architect, or technical mentor in Ghaziabad, Delhi NCR, or remote? Reach out today for collaboration and enterprise engineering.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={`mailto:${profile.contact.email}`}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all flex items-center gap-2 shadow-lg"
              >
                <FaEnvelope className="h-4 w-4" />
                {profile.contact.email}
              </a>

              <a
                href={`tel:${profile.contact.phone}`}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2"
              >
                <FaPhone className="h-4 w-4" />
                {profile.contact.phone}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManishKumarProfilePage;
