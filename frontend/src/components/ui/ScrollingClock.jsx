import React, { useState, useEffect } from 'react';
import { FaGlobe, FaClock } from 'react-icons/fa6';
import { RollingDigit } from './ScrollingNumber';

const TIMEZONES = [
  { label: 'IST', city: 'Bengaluru / New Delhi', timeZone: 'Asia/Kolkata' },
  { label: 'UTC', city: 'London', timeZone: 'UTC' },
  { label: 'EST', city: 'New York', timeZone: 'America/New_York' },
  { label: 'PST', city: 'San Francisco', timeZone: 'America/Los_Angeles' },
  { label: 'JST', city: 'Tokyo', timeZone: 'Asia/Tokyo' },
];

export const ScrollingClock = ({
  size = 'md', // 'sm', 'md', 'lg'
  showTimezone = true,
  neonColor = 'pink', // 'pink', 'cyan', 'yellow'
  className = '',
}) => {
  const [selectedTzIdx, setSelectedTzIdx] = useState(0);
  const [timeState, setTimeState] = useState({
    h1: '1',
    h2: '2',
    m1: '0',
    m2: '0',
    s1: '0',
    s2: '0',
    ampm: 'PM',
  });

  const activeTz = TIMEZONES[selectedTzIdx];

  useEffect(() => {
    const update = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: activeTz.timeZone,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        const parts = formatter.formatToParts(now);
        let hourStr = '12';
        let minStr = '00';
        let secStr = '00';
        let dayPeriod = 'PM';

        parts.forEach((p) => {
          if (p.type === 'hour') hourStr = p.value.padStart(2, '0');
          if (p.type === 'minute') minStr = p.value.padStart(2, '0');
          if (p.type === 'second') secStr = p.value.padStart(2, '0');
          if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
        });

        setTimeState({
          h1: hourStr[0] || '0',
          h2: hourStr[1] || '0',
          m1: minStr[0] || '0',
          m2: minStr[1] || '0',
          s1: secStr[0] || '0',
          s2: secStr[1] || '0',
          ampm: dayPeriod,
        });
      } catch (err) {
        // Fallback to local time
        const now = new Date();
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const hourStr = String(hours).padStart(2, '0');
        const minStr = String(now.getMinutes()).padStart(2, '0');
        const secStr = String(now.getSeconds()).padStart(2, '0');

        setTimeState({
          h1: hourStr[0],
          h2: hourStr[1],
          m1: minStr[0],
          m2: minStr[1],
          s1: secStr[0],
          s2: secStr[1],
          ampm,
        });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTz]);

  // Size configurations
  const config = {
    sm: { height: 28, width: 16, fontSize: 'text-sm sm:text-base', gap: 'gap-0.5', pad: 'px-3 py-1.5' },
    md: { height: 42, width: 24, fontSize: 'text-xl sm:text-2xl', gap: 'gap-1', pad: 'px-4 py-2' },
    lg: { height: 58, width: 34, fontSize: 'text-3xl sm:text-4xl', gap: 'gap-1.5', pad: 'px-6 py-3' },
  }[size] || { height: 42, width: 24, fontSize: 'text-2xl', gap: 'gap-1', pad: 'px-4 py-2' };

  const neonTextClasses = {
    pink: 'neon-text-pink',
    cyan: 'neon-text-cyan',
    yellow: 'neon-text-yellow',
  }[neonColor] || 'neon-text-pink';

  const cardNeonClass = {
    pink: 'dark:neon-acrylic-pink',
    cyan: 'dark:neon-acrylic-cyan',
    yellow: 'dark:neon-acrylic-yellow',
  }[neonColor] || 'dark:neon-acrylic-pink';

  return (
    <div
      className={`inline-flex flex-col sm:flex-row items-center justify-between gap-3 ${config.pad} rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 ${cardNeonClass} shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Clock Icon & Timezone Title */}
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-xl bg-pink-500/15 dark:bg-pink-500/25 text-pink-500 dark:text-pink-400 flex items-center justify-center shadow-[0_0_10px_rgba(255,45,135,0.4)]">
          <FaClock className="h-3.5 w-3.5" />
        </span>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-pink-300">
            Live Market Clock
          </p>
          {showTimezone && (
            <button
              onClick={() => setSelectedTzIdx((prev) => (prev + 1) % TIMEZONES.length)}
              className="text-[11px] font-bold text-slate-800 dark:text-white hover:text-pink-500 flex items-center gap-1 cursor-pointer transition-colors"
              title="Click to toggle timezone"
            >
              <span>{activeTz.city}</span>
              <span className="text-[10px] text-pink-400 font-extrabold">({activeTz.label})</span>
            </button>
          )}
        </div>
      </div>

      {/* Rolling Numbers Display */}
      <div className={`flex items-center ${config.gap} font-mono font-black`}>
        {/* Hours */}
        <div className="flex items-center">
          <RollingDigit digit={timeState.h1} height={config.height} width={config.width} fontSize={config.fontSize} className={neonTextClasses} />
          <RollingDigit digit={timeState.h2} height={config.height} width={config.width} fontSize={config.fontSize} className={neonTextClasses} />
        </div>

        {/* Pulsing Colon */}
        <span
          style={{ height: `${config.height}px`, lineHeight: `${config.height}px` }}
          className={`px-0.5 font-black ${config.fontSize} ${neonTextClasses} animate-pulse`}
        >
          :
        </span>

        {/* Minutes */}
        <div className="flex items-center">
          <RollingDigit digit={timeState.m1} height={config.height} width={config.width} fontSize={config.fontSize} className={neonTextClasses} />
          <RollingDigit digit={timeState.m2} height={config.height} width={config.width} fontSize={config.fontSize} className={neonTextClasses} />
        </div>

        {/* Pulsing Colon */}
        <span
          style={{ height: `${config.height}px`, lineHeight: `${config.height}px` }}
          className={`px-0.5 font-black ${config.fontSize} ${neonTextClasses} animate-pulse`}
        >
          :
        </span>

        {/* Seconds */}
        <div className="flex items-center">
          <RollingDigit digit={timeState.s1} height={config.height} width={config.width} fontSize={config.fontSize} className="neon-text-cyan" />
          <RollingDigit digit={timeState.s2} height={config.height} width={config.width} fontSize={config.fontSize} className="neon-text-cyan" />
        </div>

        {/* AM / PM Badge */}
        <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_8px_rgba(255,45,135,0.4)]">
          {timeState.ampm}
        </span>
      </div>
    </div>
  );
};

export default ScrollingClock;
