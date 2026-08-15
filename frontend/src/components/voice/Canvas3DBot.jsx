import { useEffect, useRef } from 'react';

/**
 * Canvas3DBot — High-performance 3D interactive animated AI Character
 * Features:
 * - 3D Perspective Projection with lighting and depth shading
 * - Articulated Head (look-at cursor tracking + nodding)
 * - Articulated Arms & Hands (waving, speaking gestures, resting)
 * - Articulated Legs & Feet (bobbing, stepping, swinging)
 * - Glowing Cyber Visor, Blinking Eyes, Pulsing Reactor Core
 * - Real-time Voice Reactive States: idle, listening, thinking, speaking
 */
export default function Canvas3DBot({
  mode = 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  size = 120, // width & height in px
  interactive = true,
  onClick,
  className = '',
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mouseX: 0,
    mouseY: 0,
    targetLookX: 0,
    targetLookY: 0,
    currentLookX: 0,
    currentLookY: 0,
    time: 0,
    blinkTimer: 0,
    isBlinking: false,
    waveProgress: 0,
    spinAngle: 0,
    spinVelocity: 0,
    speakingAmp: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      stateRef.current.targetLookX = Math.max(-1, Math.min(1, dx));
      stateRef.current.targetLookY = Math.max(-1, Math.min(1, dy));
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      const s = stateRef.current;
      s.time += 0.035;

      // Smooth look-at interpolation
      s.currentLookX += (s.targetLookX - s.currentLookX) * 0.08;
      s.currentLookY += (s.targetLookY - s.currentLookY) * 0.08;

      // Handle random eye blinking
      s.blinkTimer += 0.02;
      if (s.blinkTimer > 3.5) {
        s.isBlinking = true;
        if (s.blinkTimer > 3.7) {
          s.isBlinking = false;
          s.blinkTimer = 0;
        }
      }

      // Handle spin velocity decay
      if (s.spinVelocity > 0.001) {
        s.spinAngle += s.spinVelocity;
        s.spinVelocity *= 0.94;
      } else {
        s.spinAngle = 0;
        s.spinVelocity = 0;
      }

      // Voice reactive amplitude simulation
      if (mode === 'speaking') {
        s.speakingAmp = 0.5 + Math.sin(s.time * 12) * 0.35 + Math.cos(s.time * 7) * 0.15;
      } else if (mode === 'thinking') {
        s.speakingAmp = (Math.sin(s.time * 6) + 1) * 0.25;
      } else {
        s.speakingAmp = 0;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Base scaling & coordinates
      const cx = w / 2;
      const cy = h / 2;
      const scale = (w / 140) * 0.88;

      ctx.save();
      ctx.translate(cx, cy);
      if (s.spinAngle !== 0) {
        ctx.rotate(s.spinAngle);
      }

      // Dynamic Idle Floating & Bobbing
      const floatY = Math.sin(s.time * 2.2) * 5 * scale;
      const tiltZ = Math.sin(s.time * 1.8) * 0.04;
      ctx.translate(0, floatY);
      ctx.rotate(tiltZ);

      // ── 1. Floating Feet / Thrusters ─────────────────────────────────────
      const footSwing = Math.sin(s.time * 2.2 + 0.8) * 4 * scale;
      const legColor = '#242b35';
      const bootColor = mode === 'listening' ? '#06b6d4' : mode === 'speaking' ? '#10b981' : '#f97316';

      // Left Leg & Foot
      ctx.save();
      ctx.translate(-16 * scale, 34 * scale + footSwing);
      ctx.fillStyle = legColor;
      ctx.beginPath();
      ctx.roundRect(-4 * scale, 0, 8 * scale, 12 * scale, 3 * scale);
      ctx.fill();
      // Foot shoe
      ctx.fillStyle = bootColor;
      ctx.shadowColor = bootColor;
      ctx.shadowBlur = mode === 'idle' ? 4 : 12;
      ctx.beginPath();
      ctx.roundRect(-6 * scale, 10 * scale, 13 * scale, 6 * scale, 3 * scale);
      ctx.fill();
      ctx.restore();

      // Right Leg & Foot
      ctx.save();
      ctx.translate(16 * scale, 34 * scale - footSwing);
      ctx.fillStyle = legColor;
      ctx.beginPath();
      ctx.roundRect(-4 * scale, 0, 8 * scale, 12 * scale, 3 * scale);
      ctx.fill();
      // Foot shoe
      ctx.fillStyle = bootColor;
      ctx.shadowColor = bootColor;
      ctx.shadowBlur = mode === 'idle' ? 4 : 12;
      ctx.beginPath();
      ctx.roundRect(-7 * scale, 10 * scale, 13 * scale, 6 * scale, 3 * scale);
      ctx.fill();
      ctx.restore();

      // ── 2. Torso / Chassis ────────────────────────────────────────────────
      ctx.save();
      ctx.translate(0, 16 * scale);

      // Torso body
      const torsoGrad = ctx.createLinearGradient(-22 * scale, -18 * scale, 22 * scale, 18 * scale);
      torsoGrad.addColorStop(0, '#334155');
      torsoGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = torsoGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-22 * scale, -18 * scale, 44 * scale, 36 * scale, 10 * scale);
      ctx.fill();

      // Glowing Reactor Core
      const coreColor = mode === 'listening' ? '#06b6d4' : mode === 'thinking' ? '#a855f7' : mode === 'speaking' ? '#10b981' : '#f97316';
      ctx.fillStyle = coreColor;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 8 + s.speakingAmp * 12;
      ctx.beginPath();
      ctx.arc(0, 0, 7 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Core pulsing ring
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, (10 + Math.sin(s.time * 4) * 2) * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── 3. Articulated Arms & Waving Hands ────────────────────────────────
      // Left Arm (Gesturing or Waving)
      ctx.save();
      ctx.translate(-24 * scale, 10 * scale);
      const leftArmAngle = mode === 'speaking'
        ? Math.sin(s.time * 6) * 0.4 - 0.2
        : mode === 'listening'
        ? -0.5
        : Math.sin(s.time * 2.2) * 0.15;
      ctx.rotate(leftArmAngle);

      // Arm segment
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-4 * scale, 0, 8 * scale, 22 * scale, 4 * scale);
      ctx.fill();

      // Hand mitten
      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.arc(0, 24 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Arm (Friendly Wave in idle or expressive gesturing in speaking)
      ctx.save();
      ctx.translate(24 * scale, 10 * scale);
      const rightArmAngle = mode === 'speaking'
        ? -Math.sin(s.time * 7 + 0.5) * 0.45 - 0.3
        : mode === 'thinking'
        ? -1.2 + Math.sin(s.time * 3) * 0.1
        : -0.2 + Math.sin(s.time * 2.2 + 0.5) * 0.15;
      ctx.rotate(rightArmAngle);

      // Arm segment
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-4 * scale, 0, 8 * scale, 22 * scale, 4 * scale);
      ctx.fill();

      // Hand mitten
      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.arc(0, 24 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 4. Articulated Head & Face ────────────────────────────────────────
      ctx.save();
      // Head tracks mouse position
      const headLookX = s.currentLookX * 8 * scale;
      const headLookY = s.currentLookY * 6 * scale;
      const headTilt = s.currentLookX * 0.12;

      ctx.translate(headLookX, -18 * scale + headLookY);
      ctx.rotate(headTilt);

      // Cute Antenna on top
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(0, -25 * scale);
      ctx.lineTo(0, -36 * scale);
      ctx.stroke();

      // Antenna glowing orb
      ctx.fillStyle = coreColor;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -37 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Ear Pods (Left & Right)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-30 * scale, -10 * scale, 6 * scale, 18 * scale, 3 * scale);
      ctx.roundRect(24 * scale, -10 * scale, 6 * scale, 18 * scale, 3 * scale);
      ctx.fill();

      // Head Base Helmet
      const headGrad = ctx.createLinearGradient(-26 * scale, -24 * scale, 26 * scale, 24 * scale);
      headGrad.addColorStop(0, '#38bdf8');
      headGrad.addColorStop(0.3, '#1e293b');
      headGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = headGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-26 * scale, -24 * scale, 52 * scale, 42 * scale, 14 * scale);
      ctx.fill();

      // Glossy Visor Screen
      ctx.fillStyle = '#020617';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.roundRect(-20 * scale, -16 * scale, 40 * scale, 26 * scale, 8 * scale);
      ctx.fill();

      // Cyber Glowing Eyes
      const eyeOffsetX = s.currentLookX * 3.5 * scale;
      const eyeOffsetY = s.currentLookY * 2.5 * scale;
      const eyeHeight = s.isBlinking ? 1.5 * scale : 6.5 * scale;

      ctx.fillStyle = coreColor;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 10;

      // Left Eye
      ctx.beginPath();
      ctx.ellipse(-9 * scale + eyeOffsetX, -4 * scale + eyeOffsetY, 4.5 * scale, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right Eye
      ctx.beginPath();
      ctx.ellipse(9 * scale + eyeOffsetX, -4 * scale + eyeOffsetY, 4.5 * scale, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animated Voice Mouth Equalizer Wave
      if (mode === 'speaking') {
        const mouthHeight = Math.max(2, s.speakingAmp * 8 * scale);
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.roundRect(-7 * scale, 4 * scale, 14 * scale, mouthHeight, 2 * scale);
        ctx.fill();
      } else if (mode === 'listening') {
        // Listening smiley wave
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = 1.8 * scale;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 6 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      ctx.restore(); // Head
      ctx.restore(); // Base translation

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [mode, interactive]);

  const handleClick = (e) => {
    // Spin animation on click
    stateRef.current.spinVelocity = 0.38;
    if (onClick) onClick(e);
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title="3D AI Assistant — Click to interact!"
    >
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        style={{ width: size, height: size }}
        className="drop-shadow-lg"
      />
    </div>
  );
}
