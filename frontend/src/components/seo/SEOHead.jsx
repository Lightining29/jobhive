import { useEffect } from 'react';

const DEFAULT_TITLE = 'Job Workplace - Find Dream Jobs, Tech Careers & Remote Work';
const DEFAULT_DESCRIPTION = 'Explore 10,000+ verified job openings in Java, React, Tech, Non-Technical, and Remote roles. AI-powered matching from top global companies and startups.';
const DEFAULT_KEYWORDS = 'jobs, java jobs, remote jobs, software developer jobs, tech careers, hiring in India, fresher jobs, internships, work from home, IT jobs, react developer, python jobs, full stack developer, Manish Kumar Java Developer';
const DEFAULT_IMAGE = '/assets/job-workplace-banner.svg';
const SITE_NAME = 'Job Workplace';

export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
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

    // Helper to set or create link tag
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Helper to get real production origin (never localhost)
    const getCleanOrigin = () => {
      if (typeof window === 'undefined') return 'https://jobworkplace.com';
      const org = window.location.origin;
      if (!org || org.includes('localhost') || org.includes('127.0.0.1') || org.includes('0.0.0.0')) {
        return 'https://jobworkplace.com';
      }
      return org.replace(/\/$/, '');
    };

    const cleanOrigin = getCleanOrigin();

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    setMetaTag('name', 'keywords', keywordsStr);
    setMetaTag('name', 'author', 'Job Workplace by Appletree Infotech');
    // max-image-preview:large ensures Google search result thumbnail renders on the right side
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. Canonical URL
    let currentUrl = canonicalUrl;
    if (!currentUrl) {
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const search = typeof window !== 'undefined' ? window.location.search : '';
      currentUrl = `${cleanOrigin}${pathname}${search}`;
    }
    setLinkTag('canonical', currentUrl);

    // 4. Absolute High-Resolution OpenGraph & Search Thumbnail Image
    const fullOgImage = ogImage?.startsWith('http')
      ? ogImage
      : `${cleanOrigin}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

    // Standard Google Search Thumbnail attributes
    setMetaTag('name', 'image', fullOgImage);
    setMetaTag('name', 'thumbnail', fullOgImage);
    setLinkTag('image_src', fullOgImage);

    // OpenGraph Tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:image', fullOgImage);
    setMetaTag('property', 'og:image:secure_url', fullOgImage);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', formattedTitle);

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullOgImage);

    // 5. JSON-LD Structured Data Schema with primaryImageOfPage & image
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
      // Default WebSite + Organization + ImageObject Schema
      const defaultSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${cleanOrigin}/#organization`,
            'name': 'Job Workplace',
            'alternateName': 'JobHive',
            'url': cleanOrigin,
            'logo': `${cleanOrigin}/assets/job-workplace-banner.svg`,
            'image': `${cleanOrigin}/assets/job-workplace-banner.svg`,
            'description': 'AI-driven employment marketplace connecting candidates with verified tech & non-tech job opportunities.',
          },
          {
            '@type': 'WebSite',
            '@id': `${cleanOrigin}/#website`,
            'url': cleanOrigin,
            'name': 'Job Workplace',
            'publisher': { '@id': `${cleanOrigin}/#organization` },
            'potentialAction': {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${cleanOrigin}/jobs?search={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'WebPage',
            '@id': currentUrl,
            'url': currentUrl,
            'name': formattedTitle,
            'description': description,
            'primaryImageOfPage': {
              '@type': 'ImageObject',
              'url': fullOgImage,
              'width': 1200,
              'height': 630,
            },
            'image': {
              '@type': 'ImageObject',
              'url': fullOgImage,
              'width': 1200,
              'height': 630,
            },
            'thumbnailUrl': fullOgImage,
          },
        ],
      };
      scriptTag.textContent = JSON.stringify(defaultSchema);
    }
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, schema, noIndex]);

  return null;
};

export default SEOHead;
