import { motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, className, y = 12 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Stagger = ({ children, className, stagger = 0.06 }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SectionTitle = ({ title, subtitle, action }) => (
  <div className="flex items-end justify-between mb-4">
    <div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);
