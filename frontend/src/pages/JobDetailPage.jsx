import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  FaLocationDot, FaClock, FaBriefcase, FaArrowUpRightFromSquare, FaRegBookmark, FaBookmark,
  FaArrowLeft, FaFlag, FaCircleCheck, FaEnvelope, FaSackDollar, FaBolt,
  FaInfo, FaStar, FaWrench, FaGift, FaListCheck, FaCrosshairs, FaChartLine, FaGraduationCap, FaEllipsis,
} from 'react-icons/fa6';
import { jobService, candidateService } from '../services';
import { useAuth } from '../context/AuthContext';
import { CompanyLogo } from '../components/jobs/JobCard';
import { formatSalary, timeAgo, capitalize, WORK_MODE_LABELS, EMPLOYMENT_LABELS, matchColor } from '../utils/format';
import { PageLoader } from '../components/ui/States';
import JobCard from '../components/jobs/JobCard';
import SEOHead from '../components/seo/SEOHead';

const SECTION_ICONS = {
  Briefcase: FaBriefcase,
  Building: FaInfo,
  LocationDot: FaLocationDot,
  SackDollar: FaSackDollar,
  Info: FaInfo,
  Crosshairs: FaCrosshairs,
  ListCheck: FaListCheck,
  Star: FaStar,
  Wrench: FaWrench,
  ChartLine: FaChartLine,
  GraduationCap: FaGraduationCap,
  Gift: FaGift,
  Ellipsis: FaEllipsis,
};

const SECTION_COLORS = {
  summary: 'from-blue-500 to-blue-600',
  position: 'from-indigo-500 to-indigo-600',
  department: 'from-violet-500 to-violet-600',
  location: 'from-emerald-500 to-emerald-600',
  compensation: 'from-green-500 to-green-600',
  about: 'from-sky-500 to-sky-600',
  mission: 'from-purple-500 to-purple-600',
  responsibilities: 'from-amber-500 to-amber-600',
  requirements: 'from-rose-500 to-rose-600',
  skills: 'from-cyan-500 to-cyan-600',
  experience: 'from-orange-500 to-orange-600',
  education: 'from-teal-500 to-teal-600',
  perks: 'from-pink-500 to-pink-600',
  other: 'from-slate-500 to-slate-600',
};

const parseDescription = (raw) => {
  // Step 1: Clean HTML
  let text = (raw || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|h[1-6]|tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/^[A-Z]{2,5}\d{3,8}[A-Z]?\d*\s*/i, '')
    .replace(/^(?:req|jb|jr|jid|position\s*id|job\s*id|requisition)\s*[:#]?\s*\d+\s*/i, '')
    .replace(/•|·|▪/g, '\n')
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .trim();
  if (!text) return [];

  // Step 2: Insert newlines before section headers that appear mid-line
  const sectionKeywords = [
    'position', 'role', 'designation', 'job title',
    'department', 'team', 'division',
    'location', 'work location', 'workplace',
    'compensation', 'salary', 'pay', 'stipend', 'ctc', 'package',
    'about the role', 'about the position', 'about the job', 'about the company', 'about us', 'who we are', 'company overview',
    'mission of the role', 'mission',
    'key responsibilities', 'responsibilities', 'what you\'ll do', 'your responsibilities', 'day-to-day key responsibilities', 'day-to-day responsibilities', 'role and responsibilities', 'what you will do',
    'requirements', 'qualifications', 'what we\'re looking for', 'we are looking for', 'skills and qualifications', 'mandatory requirements', 'must-have',
    'skills required', 'required skills', 'key skills', 'technologies', 'tools', 'tech stack', 'proficiency',
    'experience', 'experience required', 'years of experience',
    'education', 'educational qualifications', 'degree',
    'perks', 'benefits', 'what we offer', 'what you\'ll get', 'our benefits', 'perks and benefits',
    'other information', 'additional information',
  ];
  const kwPattern = sectionKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const sectionRegex = new RegExp(`(?:^|\\s)(?:${kwPattern})\\s*:`, 'gi');
  text = text.replace(sectionRegex, (match) => '\n' + match.trim());

  // Step 3: Split numbered items "1. item 2. item" into separate lines
  text = text.replace(/(\d+[\.)]\s)/g, '\n$1');

  // Step 4: Split on newlines and clean
  const lines = text.split('\n').map(l => l.replace(/^\s*[-•·▪]\s*/, '').trim()).filter(Boolean);

  // Step 5: Define section patterns (match at start of any line)
  const sectionDefs = [
    { key: 'position', label: 'Position', icon: 'Briefcase', regex: /^(?:position|role|designation|job\s*title)\s*:\s*/i },
    { key: 'department', label: 'Department', icon: 'Building', regex: /^(?:department|team|division)\s*:\s*/i },
    { key: 'location', label: 'Location', icon: 'LocationDot', regex: /^(?:location|work\s*location|workplace)\s*:\s*/i },
    { key: 'compensation', label: 'Compensation', icon: 'SackDollar', regex: /^(?:compensation|salary|pay|stipend|ctc|package)\s*:\s*/i },
    { key: 'about', label: 'About the Role', icon: 'Info', regex: /^(?:about\s+(?:the\s+)?(?:role|position|job|opportunity|us|company)|who\s+we\s+are|company\s+overview|about\s+us)\s*:\s*/i },
    { key: 'mission', label: 'Mission', icon: 'Crosshairs', regex: /^(?:mission\s+of\s+the\s+role|mission)\s*:\s*/i },
    { key: 'responsibilities', label: 'Key Responsibilities', icon: 'ListCheck', regex: /^(?:key\s+responsibilities|responsibilities|what\s+you['']?ll\s+do|your\s+responsibilities|day[\s-]to[\s-]day\s+(?:key\s+)?responsibilities|role\s+and\s+responsibilities|what\s+you\s+will\s+do)\s*:\s*/i },
    { key: 'requirements', label: 'Requirements', icon: 'Star', regex: /^(?:requirements?|qualifications?|what\s+we['']?re\s+looking\s+for|we\s+are\s+looking\s+for|skills?\s+and\s+qualifications?|mandatory\s+requirements?|must[\s-]have)\s*:\s*/i },
    { key: 'skills', label: 'Skills Required', icon: 'Wrench', regex: /^(?:skills?\s+required|required\s+skills?|key\s+skills?|technologies|tools|tech\s+stack|proficiency)\s*:\s*/i },
    { key: 'experience', label: 'Experience', icon: 'ChartLine', regex: /^(?:experience|experience\s+required|years?\s+of\s+experience)\s*:\s*/i },
    { key: 'education', label: 'Education', icon: 'GraduationCap', regex: /^(?:education|educational?\s+qualifications?|degree)\s*:\s*/i },
    { key: 'perks', label: 'Perks & Benefits', icon: 'Gift', regex: /^(?:perks|benefits|what\s+we\s+offer|what\s+you['']?ll\s+get|our\s+benefits?|perks\s+and\s+benefits?)\s*:\s*/i },
    { key: 'other', label: 'Other Information', icon: 'Ellipsis', regex: /^(?:other\s+(?:information|details?|requirements?)|additional\s+(?:information|notes?|requirements?))\s*:\s*/i },
  ];

  // Step 6: Assign each line to a section
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    let matched = false;
    for (const sec of sectionDefs) {
      const m = line.match(sec.regex);
      if (m) {
        // Start new section
        const content = line.substring(m[0].length).trim();
        currentSection = { key: sec.key, label: sec.label, icon: sec.icon, items: content ? [content] : [] };
        sections.push(currentSection);
        matched = true;
        break;
      }
    }
    if (!matched && currentSection) {
      // Append to current section
      if (line.length > 3) currentSection.items.push(line);
    } else if (!matched && !currentSection) {
      // No section yet — create overview
      currentSection = { key: 'about', label: 'About the Role', icon: 'Info', items: [line] };
      sections.push(currentSection);
    }
  }

  // Step 7: Clean up items — remove trailing partial sentences, trim
  for (const sec of sections) {
    sec.items = sec.items
      .map(i => i.replace(/^\d+[\.)]\s*/, '').trim())
      .filter(i => i.length > 2 && i.length < 400);
  }

  // Remove empty sections
  return sections.filter(s => s.items.length > 0);
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center text-ink shrink-0">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-ink break-words">{value || 'Not specified'}</p>
    </div>
  </div>
);

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, savedJobs, toggleSaved, refreshUser } = useAuth();
  
  const initialJob = location.state?.initialJob || jobService.getCachedJob(id) || null;
  const [job, setJob] = useState(initialJob);
  const [related, setRelated] = useState([]);
  const [match, setMatch] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(!initialJob);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const isSaved = savedJobs.some((j) => j._id === id);

  const load = useCallback(async () => {
    try {
      const { data } = await jobService.get(id);
      if (data?.job) {
        setJob(data.job);
        jobService.setCachedJob(id, data.job);
      }
      setRelated(data.related || []);
      setMatch(data.match);
      setApplied(Boolean(data.applied));
      if (data.applied) refreshUser();
    } catch (err) {
      if (!job && !initialJob) {
        toast.error(err.message);
        navigate('/jobs');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, refreshUser, job, initialJob]);

  useEffect(() => {
    const cached = jobService.getCachedJob(id);
    if (cached && !job) {
      setJob(cached);
      setLoading(false);
    }
    load();
  }, [id, load]);

  const apply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/auth/login');
      return;
    }
    if (user.role !== 'candidate') {
      toast.error('Only candidate accounts can apply');
      return;
    }
    try {
      const { data } = await jobService.apply(id, {});
      toast.success(data.message);
      setApplied(true);
      refreshUser();
      if (data.redirectUrl) {
        setTimeout(() => window.open(data.redirectUrl, '_blank', 'noopener,noreferrer'), 800);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const report = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReporting(true);
    try {
      const { data } = await jobService.report(id, { reason: reportReason });
      toast.success(data.message);
      setReportReason('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReporting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] py-8">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="h-44 bg-white dark:bg-[#0a101f] rounded-3xl border border-slate-200 dark:border-cyan-500/20 animate-pulse p-8 flex flex-col justify-between" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white dark:bg-[#0a101f] rounded-3xl border border-slate-200 dark:border-cyan-500/20 animate-pulse" />
            <div className="h-96 bg-white dark:bg-[#0a101f] rounded-3xl border border-slate-200 dark:border-cyan-500/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const canApply = !applied;
  const actionButtons = (
    <>
      <button
        onClick={() => user ? toggleSaved(id) : (toast('Login to save jobs'), navigate('/auth/login'))}
        className={`btn ${isSaved ? 'btn-dark' : 'btn-outline'}`}
      >
        {isSaved ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />}
        {isSaved ? 'Saved' : 'Save'}
      </button>
      {canApply ? (
        <button onClick={apply} className="btn-primary">
          <FaBolt className="h-4 w-4" /> {user?.role === 'candidate' ? 'Apply Now' : 'Login to Apply'}
        </button>
      ) : (
        <button disabled className="btn bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default">
          <FaCircleCheck className="h-4 w-4" /> Applied
        </button>
      )}
    </>
  );

  const cleanDesc = (job.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250);
  const pageMetaTitle = `${job.jobTitle} at ${job.companyName}`;
  const pageMetaDesc = `${job.jobTitle} position at ${job.companyName}. Location: ${job.location || 'Remote/India'}. Salary: ${formatSalary(job)}. Apply directly on Job Workplace.`;

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.jobTitle,
    'description': cleanDesc || `${job.jobTitle} vacancy at ${job.companyName}`,
    'datePosted': job.postedDate || job.createdAt || new Date().toISOString(),
    'validThrough': job.expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    'employmentType': job.employmentType === 'full_time' ? 'FULL_TIME' : job.employmentType === 'part_time' ? 'PART_TIME' : job.employmentType === 'contract' ? 'CONTRACTOR' : job.employmentType === 'internship' ? 'INTERN' : 'FULL_TIME',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.companyName || 'Job Workplace Partner',
      'sameAs': job.companyWebsite || undefined,
      'logo': job.companyLogo || undefined,
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.city || (job.location?.split(',')?.[0]?.trim()) || 'Bengaluru',
        'addressCountry': job.country || 'IN',
      },
    },
    ...(job.workMode === 'remote' || job.remote ? {
      'jobLocationType': 'TELECOMMUTE',
      'applicantLocationRequirements': {
        '@type': 'Country',
        'name': 'Worldwide',
      },
    } : {}),
    ...(job.salaryMin ? {
      'baseSalary': {
        '@type': 'MonetaryAmount',
        'currency': job.salaryCurrency || 'INR',
        'value': {
          '@type': 'QuantitativeValue',
          'minValue': job.salaryMin,
          'maxValue': job.salaryMax || job.salaryMin,
          'unitText': 'YEAR',
        },
      },
    } : {}),
    'directApply': true,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <SEOHead
        title={`${job.jobTitle} at ${job.companyName || 'Top Company'} | Job Workplace`}
        description={`Apply for ${job.jobTitle} position at ${job.companyName || 'Job Workplace'}. ${job.location ? `Location: ${job.location}.` : ''} Find full job details and qualifications.`}
        canonicalUrl={`/jobs/${job._id}`}
      />

      <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-6 inline-flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
        <FaArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="card p-6 sm:p-8 rounded-[24px]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <CompanyLogo logo={job.companyLogo} name={job.companyName} size="lg" className="mx-auto sm:mx-0 shrink-0" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{job.jobTitle}</h1>
            <p className="text-slate-600 dark:text-cyan-300 font-bold mt-1">{job.companyName}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-3 text-sm text-slate-500 dark:text-slate-300">
              {job.location && <span className="flex items-center gap-1.5 font-medium"><FaLocationDot className="h-3.5 w-3.5 text-cyan-400" /> {job.location}</span>}
              {job.workMode && <span className="flex items-center gap-1.5 font-medium"><FaBriefcase className="h-3.5 w-3.5 text-amber-400" /> {WORK_MODE_LABELS[job.workMode]}</span>}
              <span className="flex items-center gap-1.5 font-medium"><FaClock className="h-3.5 w-3.5 text-slate-400" /> Posted {timeAgo(job.postedDate)}</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <span className="badge bg-amber-400 text-slate-950 font-bold"><FaSackDollar className="h-3 w-3" /> {formatSalary(job)}</span>
              {job.employmentType && <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{EMPLOYMENT_LABELS[job.employmentType]}</span>}
              {job.experienceLevel && <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{capitalize(job.experienceLevel)}</span>}
              {job.category && <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 capitalize">{job.category}</span>}
              <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 capitalize">{job.source}</span>
            </div>
          </div>
          <div className="hidden md:flex md:flex-col gap-2 shrink-0">
            {actionButtons}
          </div>
        </div>

        {match && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#070e24] border border-amber-300 dark:border-cyan-500/40 dark:shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-extrabold text-lg text-slate-900 dark:text-white">{match.score}% Match</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{match.reason}</p>
              </div>
              <span className={`badge border px-3 py-1.5 text-sm font-bold ${matchColor(match.score)}`}>{match.score}%</span>
            </div>
            {(match.matchingSkills?.length > 0 || match.missingSkills?.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {match.matchingSkills.slice(0, 5).map((s) => (
                  <span key={s} className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold">+ {s}</span>
                ))}
                {match.missingSkills.slice(0, 5).map((s) => (
                  <span key={s} className="badge bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:text-rose-300 dark:border-rose-500/40 font-semibold">- {s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-8">
          <DetailRow icon={FaLocationDot} label="Location" value={job.location} />
          <DetailRow icon={FaBriefcase} label="Employment Type" value={job.employmentType && EMPLOYMENT_LABELS[job.employmentType]} />
          <DetailRow icon={FaClock} label="Posted" value={timeAgo(job.postedDate)} />
          <DetailRow icon={FaEnvelope} label="Apply via" value={job.source === 'recruiter' ? 'JobHive Portal' : job.companyWebsite || job.applicationUrl || 'External site'} />
        </div>

        <div className="mt-8">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
            Job Description
          </h2>
          <div className="space-y-5">
            {parseDescription(job.description).map((section) => {
              const IconComp = SECTION_ICONS[section.icon] || FaInfo;
              const colorCls = SECTION_COLORS[section.key] || 'from-slate-500 to-slate-600';
              return (
                <div key={section.key}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-6 w-6 rounded-md bg-gradient-to-br ${colorCls} flex items-center justify-center shrink-0`}>
                      <IconComp className="h-3.5 w-3.5 text-white" />
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{section.label}</h3>
                  </div>
                  <div className="ml-8 space-y-1.5">
                    {section.items.length === 1 ? (
                      <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-200">{section.items[0]}</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[14px] leading-relaxed text-slate-700 dark:text-slate-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {job.requiredSkills?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((s) => (
                <span key={s} className="badge bg-slate-100 text-slate-900 border-slate-200 dark:bg-[#070e24] dark:text-cyan-300 dark:border-[#00f0ff]/50 dark:shadow-[0_0_10px_rgba(0,240,255,0.25)] font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="hidden md:flex flex-wrap gap-3 mt-8">
          {canApply && (
            <button onClick={apply} className="btn-primary !px-8 !py-3">
              {user?.role === 'candidate' ? 'Apply for this job' : 'Login to Apply'}
            </button>
          )}
          {job.applicationUrl && (
            <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="btn-outline">
              <FaArrowUpRightFromSquare className="h-4 w-4" /> View on {job.source}
            </a>
          )}
        </div>
      </div>

      <details className="card p-4 mt-6">
        <summary className="flex items-center gap-2 font-semibold cursor-pointer text-sm text-muted hover:text-ink">
          <FaFlag className="h-4 w-4 text-red-400" /> Report this job
        </summary>
        <form onSubmit={report} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason (e.g. suspicious listing, spam)"
            className="input flex-1"
            required
          />
          <button type="submit" disabled={reporting} className="btn-danger shrink-0 w-full sm:w-auto">
            {reporting ? 'Sending...' : 'Submit'}
          </button>
        </form>
      </details>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-ink mb-4">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((r) => (
              <JobCard key={r._id} job={r} />
            ))}
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-line/60 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-2 max-w-5xl mx-auto">
          {actionButtons}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
