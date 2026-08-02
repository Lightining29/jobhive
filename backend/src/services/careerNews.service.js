/**
 * careerNews.service.js
 *
 * Fetches live tech hiring / career news from free RSS feeds.
 * NO AI summarization — just fast, direct RSS fetching.
 *
 * Sources:
 *   - Google News RSS (tech hiring, layoffs, remote work, AI jobs, salary)
 *   - HackerNews Algolia API (community hiring discussions)
 *
 * Results are cached in-memory for 10 minutes.
 */

const https = require('https');
const http  = require('http');
const logger = require('../config/logger');

// ── Cache ──────────────────────────────────────────────────────────────────
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let cache = { data: null, ts: 0 };

// ── RSS Feed Sources ───────────────────────────────────────────────────────
const FEEDS = [
  {
    name: 'Tech Hiring',
    url: 'https://news.google.com/rss/search?q=tech+hiring+jobs+2026&hl=en-US&gl=US&ceid=US:en',
    category: 'Hiring',
  },
  {
    name: 'Layoffs & Trends',
    url: 'https://news.google.com/rss/search?q=tech+layoffs+salary+trends+2026&hl=en-US&gl=US&ceid=US:en',
    category: 'Trends',
  },
  {
    name: 'Remote Work',
    url: 'https://news.google.com/rss/search?q=remote+work+return+to+office+2026&hl=en-US&gl=US&ceid=US:en',
    category: 'Remote Work',
  },
  {
    name: 'AI Jobs',
    url: 'https://news.google.com/rss/search?q=AI+jobs+artificial+intelligence+careers+2026&hl=en-US&gl=US&ceid=US:en',
    category: 'AI & Tech',
  },
  {
    name: 'Salary Insights',
    url: 'https://news.google.com/rss/search?q=software+engineer+salary+2026&hl=en-US&gl=US&ceid=US:en',
    category: 'Salary',
  },
  {
    name: 'Hacker News Hiring',
    url: 'https://hn.algolia.com/api/v1/search_by_date?query=hiring%20remote%20engineer&tags=comment&hitsPerPage=10',
    category: 'Community',
    isJSON: true,
  },
];

// ── HTTP GET helper ────────────────────────────────────────────────────────
function httpGet(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const parsed    = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;

    const req = transport.get(
      {
        hostname: parsed.hostname,
        port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path:     parsed.pathname + parsed.search,
        headers:  { 'User-Agent': 'JobHive-NewsBot/1.0' },
        timeout,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          return httpGet(next, timeout).then(resolve).catch(reject);
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (body += c));
        res.on('end',  () => resolve(body));
      }
    );
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

// ── RSS XML parser ─────────────────────────────────────────────────────────
function parseRSS(xml, category, limit = 6) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1];

    const title = decodeXml(extractTag(block, 'title'));
    const link  = extractTag(block, 'link') || extractTag(block, 'guid');
    const desc  = decodeXml(stripHtml(extractTag(block, 'description') || ''));
    const pub   = extractTag(block, 'pubDate');
    const src   = extractTag(block, 'source') || extractTag(block, 'dc:publisher') || '';

    if (!title || title.length < 5) continue;

    items.push({
      title:       title.trim().slice(0, 200),
      link:        link?.trim() || '',
      description: desc.slice(0, 300),
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      source:      src.trim().slice(0, 80) || 'Google News',
      category,
    });
  }

  return items;
}

// ── Parse Hacker News Algolia JSON ────────────────────────────────────────
function parseHNJSON(data, limit = 8) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return (parsed.hits || []).slice(0, limit).map(h => ({
      title:       (h.comment_text || h.story_title || '').replace(/<[^>]+>/g, '').trim().slice(0, 200),
      link:         h.story_url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      description: (h.comment_text || '').replace(/<[^>]+>/g, '').trim().slice(0, 300),
      publishedAt: h.created_at || new Date().toISOString(),
      source:      'Hacker News',
      category:    'Community',
    })).filter(i => i.title.length > 10);
  } catch {
    return [];
  }
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const m  = xml.match(re);
  return m ? m[1].trim() : '';
}

function decodeXml(str) {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&apos;/g, "'")
    .replace(/&#\d+;/g, '');
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g,  ' ')
    .replace(/\s{2,}/g,   ' ')
    .trim();
}

// ── Fetch all feeds in parallel ────────────────────────────────────────────
async function fetchAllFeeds() {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const raw = await httpGet(feed.url, 8000);
        if (feed.isJSON) {
          return parseHNJSON(raw, 6);
        }
        return parseRSS(raw, feed.category, 6);
      } catch (err) {
        logger.warn(`[careerNews] feed failed: ${feed.name}`, { message: err.message });
        return [];
      }
    })
  );

  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  // Deduplicate by title similarity
  const seen = new Set();
  return all.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Main export ────────────────────────────────────────────────────────────
async function getCareerNews(forceRefresh = false) {
  const now = Date.now();

  // Return cached data if fresh
  if (!forceRefresh && cache.data && (now - cache.ts) < CACHE_TTL) {
    return { ...cache.data, cached: true };
  }

  // Fetch articles — this is the only real work
  const articles = await fetchAllFeeds();

  const result = {
    articles,
    aiInsights: {
      marketSummary: 'The tech job market continues to evolve with strong demand for AI, cloud, and full-stack skills. Remote and hybrid roles remain popular.',
      trends: [
        'AI and machine learning skills are the most in-demand across all sectors',
        'Remote-first companies are expanding hiring internationally',
        'Salary growth is strongest for senior engineers with cloud expertise',
      ],
      tip: 'Update your LinkedIn and GitHub with current in-demand skills like AI, LLMs, and cloud platforms to increase recruiter visibility.',
    },
    fetchedAt: new Date().toISOString(),
    cached: false,
    totalCount: articles.length,
  };

  cache = { data: result, ts: now };
  return result;
}

module.exports = { getCareerNews };
