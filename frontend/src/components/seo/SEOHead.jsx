import { useEffect } from 'react';

const DEFAULT_TITLE = 'Job Workplace - Find Dream Jobs, Tech Careers & Remote Work';
const DEFAULT_DESCRIPTION = 'Explore 10,000+ verified job openings in Java, React, Tech, Non-Technical, and Remote roles. AI-powered matching from top global companies and startups.';
const DEFAULT_KEYWORDS = 'jobs, java jobs, remote jobs, software developer jobs, tech careers, hiring in India, fresher jobs, internships, work from home, IT jobs, react developer, python jobs, full stack developer';
const SITE_NAME = 'Job Workplace';

export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = 'website',
  ogImage = '/favicon.svg',
  schema,
  noIndex = false,
}) => {
  useEffect(() => {
    // 1. Document Title
    const formattedTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Helper function to set or create meta tag
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    setMetaTag('name', 'keywords', keywordsStr);
    setMetaTag('name', 'author', 'Job Workplace by Appletree Infotech');
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. Canonical URL
    const currentUrl = canonicalUrl || window.location.href.split('#')[0];
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 4. OpenGraph Tags
    const fullOgImage = ogImage?.startsWith('http') ? ogImage : `${window.location.origin}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:image', fullOgImage);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullOgImage);

    // 6. JSON-LD Structured Data Schema for Google Search
    const schemaId = 'seo-structured-data-jsonld';
    let scriptTag = document.getElementById(schemaId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (schema) {
      scriptTag.textContent = JSON.stringify(schema);
    } else {
      // Default WebSite + Organization Schema
      const defaultSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${window.location.origin}/#organization`,
            'name': 'Job Workplace',
            'alternateName': 'JobHive',
            'url': window.location.origin,
            'logo': `${window.location.origin}/favicon.svg`,
            'description': 'AI-driven employment marketplace connecting candidates with verified tech & non-tech job opportunities.',
          },
          {
            '@type': 'WebSite',
            '@id': `${window.location.origin}/#website`,
            'url': window.location.origin,
            'name': 'Job Workplace',
            'publisher': { '@id': `${window.location.origin}/#organization` },
            'potentialAction': {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${window.location.origin}/jobs?search={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      };
      scriptTag.textContent = JSON.stringify(defaultSchema);
    }
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, schema, noIndex]);

  return null;
};

export default SEOHead;
