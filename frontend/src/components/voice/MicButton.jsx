/**
 * MicButton — animated microphone button with listening state.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa6';

export default function MicButton({ isListening, isDisabled, onClick, size = 'lg' }) {
  const sizeMap = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-14 w-14 text-xl',
  };

  const ringSize = {
    sm: 'h-14 w-14',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing ring when listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              className={`absolute ${ringSize[size]} rounded-full bg-primary-500 opacity-20`}
              initial={{ scale: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className={`absolute ${ringSize[size]} rounded-full bg-primary-500 opacity-15`}
              initial={{ scale: 1 }}
              animate={{ scale: 2.0, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4, ease: 'easeOut' }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        disabled={isDisabled}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: isDisabled ? 1 : 1.06 }}
        className={`
          relative z-10 ${sizeMap[size]} rounded-full flex items-center justify-center
          font-medium transition-all duration-200 shadow-lg focus:outline-none
          focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500
          ${isListening
            ? 'bg-red-500 text-white shadow-red-200'
            : isDisabled
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'
          }
        `}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        aria-pressed={isListening}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.span
              key="stop"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <FaStop className="h-5 w-5" />
            </motion.span>
          ) : isDisabled ? (
            <motion.span
              key="disabled"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <FaMicrophoneSlash className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="mic"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <FaMicrophone className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
