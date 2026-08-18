import React, { useEffect, useRef, useState } from 'react';

/**
 * ParallaxScrollImage — Moves foreground and background layers at differential speeds
 * relative to the window scroll position, providing depth and cinematic motion.
 */
export const ParallaxScrollImage = ({
  src,
  alt = 'Visual image',
  speed = 0.2, // 0.1 to 0.5 recommended
  className = '',
  imageClassName = '',
  glowInDark = true,
  children,
  ...props
}) => {
  const containerRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            // Center of element relative to screen center
            const centerDistance = rect.top + rect.height / 2 - windowHeight / 2;
            setOffsetY(centerDistance * speed);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          style={{
            transform: `translateY(${offsetY}px) scale(1.08)`,
            transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          className={`w-full h-full object-cover will-change-transform ${glowInDark ? 'dark:drop-shadow-[0_10px_35px_rgba(99,102,241,0.25)]' : ''} ${imageClassName}`}
        />
      )}
      {children}
    </div>
  );
};

export default ParallaxScrollImage;
