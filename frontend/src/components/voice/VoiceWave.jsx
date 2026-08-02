/**
 * VoiceWave — animated bars visualiser.
 * mode: 'idle' | 'listening' | 'thinking' | 'speaking'
 */
import { motion } from 'framer-motion';

const BAR_COUNT = 5;

const configs = {
  idle: {
    heights: [4, 4, 4, 4, 4],
    color: '#94A3B8',
    duration: 0,
  },
  listening: {
    color: '#4F46E5',
    duration: 0.5,
  },
  thinking: {
    color: '#EAB308',
    duration: 0.4,
  },
  speaking: {
    color: '#10B981',
    duration: 0.3,
  },
};

export default function VoiceWave({ mode = 'idle', size = 'md' }) {
  const cfg = configs[mode] || configs.idle;

  const sizeMap = {
    sm: { height: 20, barWidth: 3, gap: 2 },
    md: { height: 32, barWidth: 4, gap: 3 },
    lg: { height: 48, barWidth: 5, gap: 4 },
  };

  const { height, barWidth, gap } = sizeMap[size] || sizeMap.md;

  const getBarVariants = (i) => {
    if (mode === 'idle') {
      return {
        animate: { scaleY: 0.15 },
      };
    }

    const delays = [0, 0.1, 0.2, 0.1, 0];
    const maxScales = {
      listening: [0.5, 0.9, 1.0, 0.9, 0.5],
      thinking: [0.3, 0.6, 1.0, 0.6, 0.3],
      speaking: [0.6, 1.0, 0.8, 1.0, 0.6],
    };

    const scales = maxScales[mode] || [0.3, 0.3, 0.3, 0.3, 0.3];

    return {
      animate: {
        scaleY: [0.15, scales[i], 0.15],
        transition: {
          duration: cfg.duration,
          repeat: Infinity,
          delay: delays[i],
          ease: 'easeInOut',
        },
      },
    };
  };

  return (
    <div
      className="flex items-center"
      style={{ gap, height }}
      role="img"
      aria-label={`Voice status: ${mode}`}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: barWidth,
            height: '100%',
            backgroundColor: cfg.color,
            borderRadius: barWidth,
            transformOrigin: 'center',
            originY: 0.5,
          }}
          {...getBarVariants(i)}
        />
      ))}
    </div>
  );
}
