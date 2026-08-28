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
  FaLinux,
  FaPhone,
  FaServer,
  FaShieldHalved,
  FaStar,
} from 'react-icons/fa6';
import { MANISH_KUMAR_PROFILE } from '../../data/manishKumarProfile';
import SEOHead from '../../components/seo/SEOHead';

export const ManishKumarDevOpsPage = () => {
  const profile = MANISH_KUMAR_PROFILE;

  const jsonLdSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': 'https://jobworkplace.com/manish-kumar/aws-devops#article',
        'headline': 'Manish Kumar: AWS Cloud Solution Architect & DevOps Engineer in Ghaziabad, India',
        'description': 'Deep-dive into Manish Kumar\'s AWS cloud infrastructure designs, Docker & Kubernetes containerization, Jenkins CI/CD automation, and Linux server hardening in Delhi NCR.',
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
        'mainEntityOfPage': 'https://jobworkplace.com/manish-kumar/aws-devops',
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://jobworkplace.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Manish Kumar', 'item': 'https://jobworkplace.com/manish-kumar' },
          { '@type': 'ListItem', 'position': 3, 'name': 'AWS & DevOps Solution Architect', 'item': 'https://jobworkplace.com/manish-kumar/aws-devops' },
        ],
      },
    ],
  }), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SEOHead
        title="Manish Kumar | Top AWS DevOps Engineer & Cloud Solution Architect in Ghaziabad, India"
        description="Comprehensive guide to the AWS Cloud & DevOps engineering capabilities of Manish Kumar. Mastering Docker, Kubernetes, Jenkins CI/CD, AWS EC2/S3/RDS/Lambda, and Linux administration in Ghaziabad & Delhi NCR."
        keywords={[
          'Manish Kumar AWS DevOps Engineer',
          'AWS Solution Architect Ghaziabad',
          'DevOps Engineer Noida',
          'Docker Kubernetes Expert Delhi NCR',
          'Jenkins CI CD Automation Engineer',
          'Linux Server Administrator Ghaziabad',
          'Manish Kumar Cloud Engineer',
        ]}
        canonicalUrl="https://jobworkplace.com/manish-kumar/aws-devops"
        schema={jsonLdSchema}
      />

      <section className="pt-14 pb-16 md:pt-18 md:pb-20 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-cyan-500/15 via-slate-50 to-slate-50 dark:from-cyan-950/30 dark:via-[#030712] dark:to-[#030712]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/manish-kumar" className="hover:underline">Manish Kumar</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">AWS & DevOps Architecture</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-900 dark:text-cyan-300 border border-cyan-400/40 mb-4">
            <FaServer className="h-3.5 w-3.5 text-cyan-500" />
            <span>Cloud & Infrastructure Authority</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            AWS Cloud Architecture & DevOps CI/CD Engineering
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 mt-4 leading-relaxed font-medium">
            How Manish Kumar provisions, automates, and secures enterprise cloud environments on Amazon Web Services, Docker, Kubernetes, and automated deployment pipelines.
          </p>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 text-slate-700 dark:text-slate-300 text-base leading-relaxed">
        {/* AWS Cloud Core Services */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            1. Amazon Web Services (AWS) Ecosystem Mastery
          </h2>
          <p>
            Manish designs scalable, multi-tier cloud architectures utilizing key AWS services with extreme cost efficiency and high availability:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/20 space-y-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Compute & Storage (EC2, S3, Lambda)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auto-scaling EC2 clusters, S3 secure bucket policies, CloudFront CDN distribution, and serverless AWS Lambda triggers.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#070e24] border border-slate-200 dark:border-cyan-500/20 space-y-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Managed Databases & Networking (RDS, VPC)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-AZ RDS PostgreSQL/MySQL failovers, custom VPC subnets, Internet Gateways, NAT Gateways, and Route53 DNS management.
              </p>
            </div>
          </div>
        </section>

        {/* Containerization & Orchestration */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            2. Docker & Kubernetes Container Orchestration
          </h2>
          <p>
            By adopting multi-stage Docker builds, Manish minimizes container image sizes by over 70%, boosting build and deployment speeds. He configures Kubernetes manifests, ingress controllers, rolling updates, and health probes to ensure zero-downtime deployments.
          </p>
        </section>

        {/* CI/CD & Linux Hardening */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            3. Automated CI/CD Pipelines & Linux Server Hardening
          </h2>
          <p>
            Implementing end-to-end automation with Jenkins and GitHub Actions ensures continuous integration, automated unit testing, code linting, security vulnerability scanning, and instant deployment to production VPS environments behind Nginx reverse proxies with automatic SSL renewal.
          </p>
        </section>

        {/* Contact CTA */}
        <section className="p-8 rounded-3xl bg-slate-900 text-white border border-cyan-400/30 space-y-4">
          <h3 className="text-xl font-black">Ready to scale your cloud infrastructure?</h3>
          <p className="text-sm text-slate-300">
            Consult with Manish Kumar for AWS cloud migration, Dockerization, or CI/CD deployment pipelines.
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

export default ManishKumarDevOpsPage;
