import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBolt,
  FaCircleCheck,
  FaCode,
  FaEnvelope,
  FaGithub,
  FaGraduationCap,
  FaLayerGroup,
  FaPhone,
  FaServer,
  FaStar,
  FaWhatsapp,
} from 'react-icons/fa6';
import { MANISH_KUMAR_PROFILE } from '../../data/manishKumarProfile';
import SEOHead from '../../components/seo/SEOHead';

export const ManishKumarJavaDeveloperPage = () => {
  const profile = MANISH_KUMAR_PROFILE;

  const jsonLdSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': 'https://jobworkplace.com/manish-kumar/java-developer#article',
        'headline': 'Manish Kumar: Enterprise Java Full Stack Developer & Spring Boot Architect in Ghaziabad, India',
        'description': 'Comprehensive technical breakdown of Manish Kumar\'s Java Full Stack expertise, Spring Boot 3 microservices, Hibernate JPA, React frontend integration, and enterprise performance tuning.',
        'author': {
          '@type': 'Person',
          'name': 'Manish Kumar',
          'url': 'https://jobworkplace.com/manish-kumar',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Job Workplace',
          'url': 'https://jobworkplace.com',
        },
        'inLanguage': 'en-US',
        'mainEntityOfPage': 'https://jobworkplace.com/manish-kumar/java-developer',
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://jobworkplace.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Manish Kumar', 'item': 'https://jobworkplace.com/manish-kumar' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Java Full Stack Developer', 'item': 'https://jobworkplace.com/manish-kumar/java-developer' },
        ],
      },
    ],
  }), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SEOHead
        title="Manish Kumar | Expert Java Full Stack Developer & Spring Boot Architect in Ghaziabad"
        description="Explore the Java Full Stack engineering mastery of Manish Kumar. Specializing in Core Java, Spring Boot 3, Spring Security, Hibernate, Microservices, and React.js integration in Ghaziabad, Delhi NCR."
        keywords={[
          'Manish Kumar Java Developer',
          'Java Full Stack Developer Ghaziabad',
          'Spring Boot Developer Noida',
          'Java Developer Delhi NCR',
          'Core Java Expert Ghaziabad',
          'Spring Boot Microservices Architect',
          'Manish Kumar ProgrammingWala Java',
        ]}
        canonicalUrl="https://jobworkplace.com/manish-kumar/java-developer"
        schema={jsonLdSchema}
      />

      <section className="pt-14 pb-16 md:pt-18 md:pb-20 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-amber-500/15 via-slate-50 to-slate-50 dark:from-cyan-950/30 dark:via-[#030712] dark:to-[#030712]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/manish-kumar" className="hover:underline">Manish Kumar</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">Java Full Stack Expertise</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 mb-4">
            <FaCode className="h-3.5 w-3.5 text-amber-500" />
            <span>Technical Authority Series</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Java Full Stack Engineering & Spring Boot Architecture
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 leading-relaxed font-medium">
            How Manish Kumar designs and delivers resilient, high-concurrency enterprise Java applications, reactive Spring Boot 3 microservices, and end-to-end cloud platforms.
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 text-slate-700 dark:text-slate-300 text-base leading-relaxed">
        {/* Core Java & Multi-threading */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            1. Core Java & Modern JVM Mastery
          </h2>
          <p>
            With strong foundations in Computer Science and Object-Oriented Software Engineering, Manish Kumar excels in Core Java (Java 8 through Java 17/21 LTS). His engineering approach focuses on:
          </p>
          <ul className="space-y-2 pl-4 list-disc marker:text-amber-500">
            <li><strong>Advanced Concurrency & Multi-threading:</strong> Utilizing Java ExecutorService, CompletableFuture, Concurrent Collections, and Lock-free synchronization to prevent thread contention.</li>
            <li><strong>Functional Programming & Streams API:</strong> Writing clean, declarative, high-throughput collection processing pipelines.</li>
            <li><strong>JVM Memory Optimization:</strong> Garbage collection tuning, heap profiling, and minimizing memory leaks in long-running enterprise services.</li>
          </ul>
        </section>

        {/* Spring Boot & Microservices */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            2. Enterprise Spring Boot 3 & Microservices
          </h2>
          <p>
            Manish has architected mission-critical microservices systems handling complex distributed workflows:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/20 space-y-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Spring Security & OAuth2</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stateless JWT token authentication, role-based access control (RBAC), and cryptographically secure password hashing.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/20 space-y-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Spring Data JPA & Hibernate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Relational entity mapping, indexed query optimization, lazy loading management, and HikariCP connection pooling.
              </p>
            </div>
          </div>
        </section>

        {/* React Frontend Integration */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            3. Seamless Frontend Integration (React & TypeScript)
          </h2>
          <p>
            As a true Full Stack Engineer, Manish bridges high-performance Java backends with responsive, stateful client interfaces built in React.js, Next.js, and TypeScript. By applying RESTful contracts, typed API clients, and optimistic UI updates, applications achieve sub-100ms response times.
          </p>
        </section>

        {/* Contact Call to Action */}
        <section className="p-8 rounded-3xl bg-slate-900 text-white border border-amber-400/30 space-y-4">
          <h3 className="text-xl font-black">Need a Senior Java Developer in Ghaziabad or Remote?</h3>
          <p className="text-sm text-slate-300">
            Contact Manish Kumar to discuss enterprise architecture, Spring Boot migration, or full-stack software consulting.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href={`mailto:${profile.contact.email}`} className="btn-primary !py-2.5 !px-5 text-xs font-bold">
              Email {profile.contact.email}
            </a>
            <a href={`tel:${profile.contact.phone}`} className="btn-secondary !py-2.5 !px-5 text-xs font-bold">
              Call {profile.contact.phone}
            </a>
          </div>
        </section>
      </article>
    </div>
  );
};

export default ManishKumarJavaDeveloperPage;
