import React, { useEffect, useRef } from 'react';

/**
 * High-performance 60fps Volumetric Live Smoke & Neon Cloud Particle Canvas
 * Generates billowing purple/magenta & cyan volumetric smoke puffs with procedural fluid physics.
 */
export const LiveSmokeEffect = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Volumetric Smoke Particle Class
    const colors = [
      { r: 168, g: 85, b: 247 },  // Purple #a855f7
      { r: 255, g: 45, b: 135 },  // Hot Pink #ff2d87
      { r: 0, g: 240, b: 255 },    // Electric Cyan #00f0ff
      { r: 120, g: 40, b: 200 },   // Deep Violet
    ];

    const particles = [];
    const maxParticles = 65;

    class SmokeParticle {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.x = width * (0.2 + Math.random() * 0.6);
        this.y = isInitial
          ? height * (0.3 + Math.random() * 0.7)
          : height * (0.75 + Math.random() * 0.25);
        this.radius = 90 + Math.random() * 160;
        this.maxRadius = this.radius * (1.8 + Math.random() * 0.8);
        this.growthRate = 0.35 + Math.random() * 0.5;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = -(0.4 + Math.random() * 0.8);
        this.alpha = 0.01;
        this.maxAlpha = 0.12 + Math.random() * 0.18;
        this.life = isInitial ? Math.random() * 300 : 0;
        this.maxLife = 320 + Math.random() * 200;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.vRot = (Math.random() - 0.5) * 0.006;
      }

      update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.vRot;
        if (this.radius < this.maxRadius) {
          this.radius += this.growthRate;
        }

        // Fade in then fade out
        const progress = this.life / this.maxLife;
        if (progress < 0.25) {
          this.alpha = (progress / 0.25) * this.maxAlpha;
        } else if (progress > 0.6) {
          this.alpha = ((1 - progress) / 0.4) * this.maxAlpha;
        }

        if (this.life >= this.maxLife || this.y < -this.radius) {
          this.reset(false);
        }
      }

      draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);

        const gradient = c.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        const { r, g, b } = this.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.alpha * 1.4})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.8})`);
        gradient.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.25})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        c.fillStyle = gradient;
        c.beginPath();
        c.arc(0, 0, this.radius, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new SmokeParticle(true));
    }

    let lastTime = performance.now();

    const render = (time) => {
      animationFrameId = requestAnimationFrame(render);
      const delta = time - lastTime;
      if (delta < 14) return; // Cap at ~60fps
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Global composite blend for realistic luminous smoke
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
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Background canvas for live billowing smoke */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-90 filter blur-[10px] scale-105"
      />

      {/* Atmospheric ambient layered fog overlays */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 65%, rgba(168,85,247,0.3) 0%, rgba(255,45,135,0.2) 40%, rgba(0,240,255,0.15) 70%, transparent 100%)',
        }}
      />
    </div>
  );
};

export default LiveSmokeEffect;
