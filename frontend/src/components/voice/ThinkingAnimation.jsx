/**
 * ThinkingAnimation — three bouncing dots shown while AI processes.
 */
import { motion } from 'framer-motion';

export default function ThinkingAnimation() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -6 },
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 w-fit max-w-xs">
      <motion.div
        className="flex items-center gap-1"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-primary-500"
            variants={dotVariants}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
      <span className="text-xs text-slate-500 ml-1">Thinking…</span>
    </div>
  );
}
