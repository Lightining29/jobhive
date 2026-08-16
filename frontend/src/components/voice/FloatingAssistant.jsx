/**
 * FloatingAssistant — the global floating button + panel that wraps VoiceAssistant.
 * Renders fixed bottom-right. Uses the current route to pass page context to AI.
 */
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FaXmark } from 'react-icons/fa6';
import VoiceAssistant from './VoiceAssistant';
import Canvas3DBot from './Canvas3DBot';

function derivePageContext(pathname) {
  const jobMatch = pathname.match(/^\/jobs\/([a-f0-9]{24})/i);
  if (jobMatch) {
    return { page: 'job_detail', jobId: jobMatch[1] };
  }
  if (pathname === '/jobs' || pathname.startsWith('/jobs/')) return { page: 'jobs' };
  if (pathname.startsWith('/candidate/dashboard'))  return { page: 'dashboard' };
  if (pathname.startsWith('/candidate/profile'))    return { page: 'profile' };
  if (pathname.startsWith('/candidate/saved-jobs')) return { page: 'saved_jobs' };
  if (pathname.startsWith('/candidate/applications')) return { page: 'applications' };
  if (pathname.startsWith('/recruiter'))            return { page: 'recruiter' };
  if (pathname.startsWith('/admin'))                return { page: 'admin' };
  return { page: 'home' };
}

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const location = useLocation();

  const pageContext = derivePageContext(location.pathname);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasNewMessage(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+A (or Cmd+Shift+A on Mac)
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      {/* Backdrop blur when open on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        role="complementary"
        aria-label="AI Assistant"
      >
        {/* Expanded assistant panel */}
        <AnimatePresence>
          {isOpen && (
            <VoiceAssistant onClose={handleClose} pageContext={pageContext} />
          )}
        </AnimatePresence>

        {/* Floating trigger button */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="open"
              onClick={handleOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative h-16 w-16 rounded-full bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white shadow-lift border-2 border-primary-500/40 flex items-center justify-center hover:border-primary-400 hover:shadow-glow transition-all group overflow-hidden"
              aria-label="Open 3D AI Assistant (Ctrl+Shift+A)"
              title="Job Workplace 3D AI Assistant (Ctrl+Shift+A)"
            >
              {/* 3D Bot Character */}
              <Canvas3DBot mode="idle" size={54} interactive={true} />

              {/* New message / active indicator */}
              {hasNewMessage && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-accent border-2 border-slate-900" />
              )}
            </motion.button>
          ) : (
            <motion.button
              key="close"
              onClick={handleClose}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="h-10 w-10 rounded-full bg-white border border-line text-muted hover:text-red-500 hover:border-red-200 shadow-soft flex items-center justify-center transition-colors"
              aria-label="Close AI Assistant"
            >
              <FaXmark className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
