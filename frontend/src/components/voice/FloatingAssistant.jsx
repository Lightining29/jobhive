/**
 * FloatingAssistant — the global floating button + panel that wraps VoiceAssistant.
 * Renders fixed bottom-right.  Uses the current route to pass page context to AI.
 */
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FaHexagonNodes, FaXmark } from 'react-icons/fa6';
import VoiceAssistant from './VoiceAssistant';

function derivePageContext(pathname) {
  // Extract job ID directly from pathname: /jobs/:id
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

  // Keyboard shortcut: Ctrl+Shift+A (or Cmd+Shift+A on Mac)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsOpen((o) => !o);
        if (!isOpen) setHasNewMessage(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

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
        aria-label="AI Voice Assistant"
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
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary-600 to-violet-700 text-white shadow-lift flex items-center justify-center hover:shadow-glow transition-shadow"
              aria-label="Open AI Voice Assistant (Ctrl+Shift+A)"
              title="JobHive AI Assistant (Ctrl+Shift+A)"
            >
              {/* Subtle pulse ring */}
              <span className="absolute inset-0 rounded-full bg-primary-500 opacity-0 animate-ping" style={{ animationDuration: '3s' }} />

              <FaHexagonNodes className="h-6 w-6 relative z-10" />

              {/* New message indicator */}
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent border-2 border-white" />
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
              aria-label="Close AI Voice Assistant"
            >
              <FaXmark className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
