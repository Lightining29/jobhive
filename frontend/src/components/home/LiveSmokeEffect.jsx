import React, { useEffect, useRef } from 'react';

/**
 * Ultra-Lightweight 60fps Volumetric Live Smoke & Neon Cloud Particle Canvas
 * Highly optimized with zero CSS blur filter overhead for silky smooth performance.
 */
export const LiveSmokeEffect = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || 600;
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      { r: 168, g: 85, b: 247 }, // Purple #a855f7
      { r: 255, g: 45, b: 135 }, // Hot Pink #ff2d87
      { r: 0, g: 240, b: 255 },   // Electric Cyan #00f0ff
    ];

    const particles = [];
    const maxParticles = 18; // Lightweight for 60fps silky smooth performance

    class SmokeParticle {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.x = width * (0.2 + Math.random() * 0.6);
        this.y = isInitial
          ? height * (0.3 + Math.random() * 0.7)
          : height * (0.75 + Math.random() * 0.25);
        this.radius = 110 + Math.random() * 140;
        this.maxRadius = this.radius * 1.8;
        this.growthRate = 0.35;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -(0.4 + Math.random() * 0.6);
        this.alpha = 0.01;
        this.maxAlpha = 0.14 + Math.random() * 0.12;
        this.life = isInitial ? Math.random() * 260 : 0;
        this.maxLife = 280 + Math.random() * 160;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        if (this.radius < this.maxRadius) {
          this.radius += this.growthRate;
        }

        const progress = this.life / this.maxLife;
        if (progress < 0.25) {
          this.alpha = (progress / 0.25) * this.maxAlpha;
        } else if (progress > 0.65) {
          this.alpha = ((1 - progress) / 0.35) * this.maxAlpha;
        }

        if (this.life >= this.maxLife || this.y < -this.radius) {
          this.reset(false);
        }
      }

      draw(c) {
        const gradient = c.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.radius
        );
        const { r, g, b } = this.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.alpha * 1.2})`);
        gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.6})`);
        gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.15})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        c.fillStyle = gradient;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new SmokeParticle(true));
    }

    let lastTime = performance.now();

    const render = (time) => {
      animationFrameId = requestAnimationFrame(render);
      const delta = time - lastTime;
      if (delta < 20) return; // Cap at smooth 50-60fps
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none will-change-transform ${className}`}>
      {/* Background canvas for live billowing smoke */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-85"
      />

      {/* Atmospheric ambient layered fog overlays */}
      <div
        className="absolute inset-0 opacity-35 mix-blend-color-dodge pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 65%, rgba(168,85,247,0.25) 0%, rgba(255,45,135,0.18) 40%, rgba(0,240,255,0.12) 70%, transparent 100%)',
        }}
      />
    </div>
  );
};

export default LiveSmokeEffect;
