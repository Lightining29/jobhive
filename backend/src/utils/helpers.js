const crypto = require('crypto');

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const formatCurrency = (amount, currency = 'USD') => {
  if (!amount) return 'Not specified';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim();

const stripHtml = (html) =>
  String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/^[A-Z]{2,5}\d{3,8}[A-Z]?\d*\s*/i, '')
    .replace(/^(?:req|jb|jr|jid|position\s*id|job\s*id|requisition)\s*[:#]?\s*\d+\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text, length = 200) => {
  const clean = stripHtml(text);
  return clean.length > length ? `${clean.slice(0, length)}...` : clean;
};

const cleanUrl = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

module.exports = {
  randomToken,
  hashToken,
  formatCurrency,
  isValidUrl,
  slugify,
  normalizeText,
  stripHtml,
  truncate,
  cleanUrl,
};
