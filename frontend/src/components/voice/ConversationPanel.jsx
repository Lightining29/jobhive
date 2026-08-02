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
