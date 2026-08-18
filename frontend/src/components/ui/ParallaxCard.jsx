import React, { useRef, useCallback } from 'react';

/**
 * High-Performance ParallaxCard
 * Directly mutates DOM styles without React state re-renders to eliminate lag completely.
 */
export const ParallaxCard = ({
  children,
  className = '',
  maxRotation = 5,
  scale = 1.015,
  glare = true,
  ...props
}) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxRotation;
      const rotateY = ((x - centerX) / centerX) * maxRotation;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;

      if (glare && glareRef.current) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 65%)`;
        glareRef.current.style.opacity = '1';
      }
    },
    [maxRotation, scale, glare]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
      {...props}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 opacity-0 z-20"
        />
      )}
    </div>
  );
};

export default ParallaxCard;
