import React, { useEffect, useState } from 'react';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Single rolling vertical digit reel (0-9)
 */
export const RollingDigit = ({ digit, height = 48, width = 28, fontSize = 'text-3xl', className = '' }) => {
  const numericVal = parseInt(digit, 10);
  const isNumber = !isNaN(numericVal) && numericVal >= 0 && numericVal <= 9;

  if (!isNumber) {
    return (
      <span
        style={{ height: `${height}px`, lineHeight: `${height}px` }}
        className={`inline-flex items-center justify-center font-black ${fontSize} ${className}`}
      >
        {digit}
      </span>
    );
  }

  return (
    <div
      style={{
        height: `${height}px`,
        width: `${width}px`,
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
      }}
      className="relative overflow-hidden inline-block select-none"
    >
      <div
        style={{
          transform: `translateY(-${numericVal * 10}%)`,
          transition: 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="flex flex-col will-change-transform"
      >
        {DIGITS.map((num) => (
          <div
            key={num}
            style={{ height: `${height}px`, lineHeight: `${height}px` }}
            className={`flex items-center justify-center font-black ${fontSize} ${className}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Scrolling number string component (e.g. "10,000+", "₹28 LPA", "98.4%")
 */
export const ScrollingNumber = ({
  value = '0',
  height = 42,
  width = 24,
  fontSize = 'text-2xl sm:text-3xl',
  className = '',
}) => {
  const stringVal = String(value);
  const chars = stringVal.split('');

  return (
    <div className="inline-flex items-center tracking-tight font-mono">
      {chars.map((ch, idx) => (
        <RollingDigit
          key={`${idx}-${ch}`}
          digit={ch}
          height={height}
          width={/\d/.test(ch) ? width : Math.max(10, width * 0.55)}
          fontSize={fontSize}
          className={className}
        />
      ))}
    </div>
  );
};

export default ScrollingNumber;
