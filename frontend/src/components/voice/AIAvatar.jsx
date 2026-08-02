/**
 * AIAvatar — animated avatar for the assistant.
 * mode: 'idle' | 'listening' | 'thinking' | 'speaking'
 */
import { motion, AnimatePresence } from 'framer-motion';
import { FaHexagonNodes } from 'react-icons/fa6';

const modeColors = {
  idle: {
    outer: 'from-primary-600 to-primary-800',
    glow: 'shadow-primary-200',
    dot: 'bg-slate-400',
  },
  listening: {
    outer: 'from-primary-500 to-violet-600',
    glow: 'shadow-primary-300',
    dot: 'bg-primary-400',
  },
  thinking: {
    outer: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-200',
    dot: 'bg-yellow-300',
  },
  speaking: {
    outer: 'from-emerald-400 to-teal-600',
    glow: 'shadow-emerald-200',
    dot: 'bg-emerald-300',
  },
};

export default function AIAvatar({ mode = 'idle', size = 'md' }) {
  const colors = modeColors[mode] || modeColors.idle;

  const sizeMap = {
    sm: { container: 'h-8 w-8', icon: 'h-4 w-4', dot: 'h-2 w-2' },
    md: { container: 'h-10 w-10', icon: 'h-5 w-5', dot: 'h-2.5 w-2.5' },
    lg: { container: 'h-14 w-14', icon: 'h-7 w-7', dot: 'h-3 w-3' },
  };

  const sizes = sizeMap[size] || sizeMap.md;

  return (
    <div className="relative flex-shrink-0">
      {/* Glow ring when active */}
      <AnimatePresence>
        {mode !== 'idle' && (
          <motion.div
            key={mode}
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.outer} opacity-30 blur-sm`}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`relative ${sizes.container} rounded-full bg-gradient-to-br ${colors.outer} flex items-center justify-center shadow-lg ${colors.glow}`}
        animate={mode === 'speaking' ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={mode === 'speaking' ? { duration: 0.5, repeat: Infinity } : {}}
      >
        <FaHexagonNodes className={`${sizes.icon} text-white`} />

        {/* Status dot */}
        <AnimatePresence>
          {mode !== 'idle' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute -bottom-0.5 -right-0.5 ${sizes.dot} rounded-full ${colors.dot} border-2 border-white`}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
