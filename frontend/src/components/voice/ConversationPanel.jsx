/**
 * ConversationPanel — scrollable message history with job result cards.
 */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIAvatar from './AIAvatar';
import ThinkingAnimation from './ThinkingAnimation';
import JobResultCard from './JobResultCard';
import { FaUser, FaArrowRight } from 'react-icons/fa6';

function ParsedQueryChips({ parsedQuery, rawQuery }) {
  if (!parsedQuery && !rawQuery) return null;
  const source = parsedQuery && Object.keys(parsedQuery).length ? parsedQuery : rawQuery;
  if (!source || Object.keys(source).length === 0) return null;

  const labelMap = {
    search: 'Role',
    skills: 'Skills',
    workMode: 'Work Mode',
    employmentType: 'Type',
    experience: 'Experience',
    city: 'City',
    country: 'Country',
    company: 'Company',
    salaryMin: 'Min Salary',
    salaryMax: 'Max Salary',
    category: 'Category',
    sort: 'Sort',
    scope: 'Scope',
    postedWithinDays: 'Posted',
  };

  const formatValue = (key, val) => {
    if (key === 'salaryMin' || key === 'salaryMax') {
      const n = Number(val);
      if (!Number.isFinite(n) || n <= 0) return null;
      return `₹${(n / 100000).toFixed(1)}L`;
    }
    if (key === 'postedWithinDays') return `${val}d`;
    if (typeof val === 'string' && val.length > 30) return val.slice(0, 30) + '…';
    return String(val);
  };

  const chips = [];
  for (const [key, val] of Object.entries(source)) {
    if (!val || (typeof val === 'string' && !val.trim())) continue;
    const label = labelMap[key] || key;
    const formatted = formatValue(key, val);
    if (formatted === null) continue;
    chips.push({ label, value: formatted });
  }
  if (!chips.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="w-full max-w-sm"
    >
      <div className="flex items-center gap-1 mb-1.5">
        <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
          Query understood
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c, i) => (
          <span
            key={c.label + i}
            className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-2 py-0.5"
          >
            <span className="font-semibold opacity-80">{c.label}:</span>
            <span>{c.value}</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ message, aiMode }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser ? (
        <AIAvatar mode={aiMode} size="sm" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
          <FaUser className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Parsed query chips — shown above assistant response after job search */}
        {!isUser && (message.parsedQuery || message.rawQuery) && (
          <ParsedQueryChips parsedQuery={message.parsedQuery} rawQuery={message.rawQuery} />
        )}

        {/* Text bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-primary-600 text-white rounded-br-sm'
              : 'bg-slate-100 text-slate-800 rounded-bl-sm'
          }`}
        >
          {message.text}
        </div>

        {/* Action link button — shown for resume/navigation intents */}
        {!isUser && message.link && (
          <Link
            to={message.link}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <FaArrowRight className="h-3 w-3" />
            {message.intent === 'resume_build' ? 'Open AI Resume Builder' :
             message.intent === 'ats_score'    ? 'Open ATS Optimizer' :
             message.intent === 'resume_help'  ? 'Open Resume Hub' :
             'Open'}
          </Link>
        )}

        {/* Job results attached to assistant messages */}
        {!isUser && message.jobs?.length > 0 && (
          <div className="w-full space-y-1.5 max-w-sm">
            {message.jobs.slice(0, 4).map((job, i) => (
              <JobResultCard key={job._id || i} job={job} index={i} />
            ))}
            {message.total > 4 && (
              <p className="text-xs text-muted text-center py-1">
                +{message.total - 4} more results
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        {!isUser && message.stats && (
          <div className="grid grid-cols-3 gap-1.5 w-full max-w-xs">
            {[
              { label: 'Avg Salary', value: `₹${((message.stats.avg || 0) / 100000).toFixed(1)}L` },
              { label: 'Min', value: `₹${((message.stats.min || 0) / 100000).toFixed(1)}L` },
              { label: 'Max', value: `₹${((message.stats.max || 0) / 100000).toFixed(1)}L` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-line rounded-xl px-2 py-1.5 text-center">
                <p className="text-[10px] text-muted">{label}</p>
                <p className="text-xs font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

export default function ConversationPanel({
  messages,
  streamingText,
  isThinking,
  isStreaming,
  aiMode,
  className = '',
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isThinking]);

  const showEmpty = !messages.length && !isThinking;

  return (
    <div
      className={`flex-1 overflow-y-auto px-4 py-3 space-y-4 ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Conversation history"
    >
      {showEmpty && (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <AIAvatar mode="idle" size="lg" />
          <p className="mt-4 text-sm font-semibold text-slate-700">Hi! I'm JobHive AI</p>
          <p className="text-xs text-muted mt-1 max-w-xs">
            Ask me anything — find jobs, prep for interviews, review your resume, or explore
            career paths.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-xs">
            {[
              'Find React jobs in Bangalore',
              'Remote Python jobs',
              'Interview prep tips',
              'Resume advice',
            ].map((hint) => (
              <span
                key={hint}
                className="text-[11px] bg-primary-50 text-primary-700 border border-primary-100 rounded-full px-2.5 py-1 cursor-default"
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} aiMode="idle" />
        ))}
      </AnimatePresence>

      {/* Thinking dots */}
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-2.5"
        >
          <AIAvatar mode="thinking" size="sm" />
          <ThinkingAnimation />
        </motion.div>
      )}

      {/* Streaming text bubble */}
      {isStreaming && streamingText && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-2.5"
        >
          <AIAvatar mode="speaking" size="sm" />
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-slate-100 text-slate-800 text-sm leading-relaxed max-w-[85%]">
            {streamingText}
            <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse align-middle" />
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
