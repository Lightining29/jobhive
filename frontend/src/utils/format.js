export const formatSalary = (job) => {
  if (!job) return 'Salary not disclosed';
  const max = Number(job.salaryMax) || Number(job.salary) || 0;
  const min = Number(job.salaryMin) || 0;
  if (!max && !min) return 'Salary not disclosed';
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: job.currency || 'USD', maximumFractionDigits: 0 }).format(n);
  if (min && max && min !== max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt(max || min);
};

export const formatCurrency = (amount = 0, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);

export const matchColor = (score) => {
  if (score >= 85) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (score >= 70) return 'bg-primary-light text-primary-dark border border-primary-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
};

export const STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-700 border border-slate-200',
  shortlisted: 'bg-blue-50 text-blue-700 border border-blue-200',
  interview: 'bg-primary-light text-primary-dark border border-primary-200',
  rejected: 'bg-red-50 text-red-600 border border-red-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  withdrawn: 'bg-slate-100 text-slate-500 border border-slate-200',
};

export const WORK_MODE_LABELS = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };
export const EMPLOYMENT_LABELS = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary',
};

export const truncate = (text, length = 120) => {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}...` : text;
};
