import { useEffect, useRef, useState } from 'react';

/**
 * GirlDoll3D (Canvas3DBot) — High-Performance 3D Animated Anime Girl Doll Character
 * 
 * Emotional & Animation States:
 * - 'happy'   : Starry eyes, beaming smile, joyful bouncing, clapping hands, floating stars
 * - 'cute'    : Big sparkling eyes, heavy rosy blush, hands in heart pose, floating love hearts (♥)
 * - 'cry'     : Tear drops streaming down, sad sniffling expression, wiping eyes
 * - 'sleep'   : Gentle closed crescent eyes, rhythmic breathing, floating 'Zzz' sleep bubbles
 * - 'speaking': Lip-sync talking mouth, conversational hand gestures, dynamic hair bounce
 * - 'listening': Curious head tilt, wide attentive sparkle eyes
 * - 'thinking': Finger on chin, looking upward, rotating sparkles
 * - 'idle'    : Natural breathing, look-at cursor tracking, periodic blinking, cute hair physics
 */
export default function Canvas3DBot({
  mode = 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'cute' | 'cry' | 'sleep'
  moodOverride = null, // Can force 'happy' | 'cute' | 'cry' | 'sleep'
  size = 130, // Dimensions in px
  interactive = true,
  showControls = false, // Show emotion picker pills
  onClick,
  className = '',
}) {
  const canvasRef = useRef(null);
  const [currentMood, setCurrentMood] = useState(moodOverride || 'cute');

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
    particles: [], // For floating hearts, tears, Zzz, and stars
    giggleTimer: 0,
    spinAngle: 0,
    spinVelocity: 0,
  });

  useEffect(() => {
    if (moodOverride) {
      setCurrentMood(moodOverride);
    }
  }, [moodOverride]);

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

    // Active emotion determination
    const getActiveEmotion = () => {
      if (mode === 'speaking') return 'speaking';
      if (mode === 'listening') return 'listening';
      if (mode === 'thinking') return 'thinking';
      return currentMood || 'cute';
    };

    const render = () => {
      const s = stateRef.current;
      s.time += 0.038;
      const activeEmotion = getActiveEmotion();

      // Smooth look-at tracking (unless sleeping)
      if (activeEmotion === 'sleep') {
        s.targetLookX = 0.2;
        s.targetLookY = 0.4;
      }
      s.currentLookX += (s.targetLookX - s.currentLookX) * 0.08;
      s.currentLookY += (s.targetLookY - s.currentLookY) * 0.08;

      // Natural eye blinking
      s.blinkTimer += 0.025;
      if (activeEmotion !== 'sleep' && activeEmotion !== 'cry') {
        if (s.blinkTimer > 3.2) {
          s.isBlinking = true;
          if (s.blinkTimer > 3.4) {
            s.isBlinking = false;
            s.blinkTimer = 0;
          }
        }
      } else {
        s.isBlinking = activeEmotion === 'sleep';
      }

      // Spin decay
      if (s.spinVelocity > 0.001) {
        s.spinAngle += s.spinVelocity;
        s.spinVelocity *= 0.93;
      } else {
        s.spinAngle = 0;
        s.spinVelocity = 0;
      }

      // ── Spawn Particles Based on Emotion ────────────────────────────────
      if (Math.random() < 0.12) {
        if (activeEmotion === 'cute') {
          s.particles.push({
            type: 'heart',
            x: (Math.random() - 0.5) * 40,
            y: 10,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.2 - Math.random() * 0.8,
            scale: 0.6 + Math.random() * 0.5,
            opacity: 1,
            life: 1,
          });
        } else if (activeEmotion === 'cry') {
          s.particles.push({
            type: 'tear',
            x: Math.random() > 0.5 ? -14 : 14,
            y: -10,
            vx: (Math.random() - 0.5) * 0.2,
            vy: 1.5 + Math.random() * 1.2,
            scale: 0.7 + Math.random() * 0.4,
            opacity: 1,
            life: 1,
          });
        } else if (activeEmotion === 'sleep') {
          s.particles.push({
            type: 'zzz',
            x: 18 + (Math.random() - 0.5) * 10,
            y: -25,
            vx: 0.6 + Math.random() * 0.4,
            vy: -0.9 - Math.random() * 0.5,
            scale: 0.7 + Math.random() * 0.4,
            opacity: 1,
            life: 1,
          });
        } else if (activeEmotion === 'happy' || activeEmotion === 'thinking') {
          s.particles.push({
            type: 'star',
            x: (Math.random() - 0.5) * 50,
            y: -10 + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.8 - Math.random() * 0.6,
            scale: 0.5 + Math.random() * 0.6,
            opacity: 1,
            life: 1,
          });
        }
      }

      // Update particles
      s.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.opacity = Math.max(0, p.life);
      });
      s.particles = s.particles.filter((p) => p.life > 0);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const scale = (w / 140) * 0.86;

      ctx.save();
      ctx.translate(cx, cy);
      if (s.spinAngle !== 0) ctx.rotate(s.spinAngle);

      // Dynamic Idle Floating & Swaying
      const bounceAmp = activeEmotion === 'happy' ? 8 : activeEmotion === 'sleep' ? 2 : 4;
      const bounceSpeed = activeEmotion === 'happy' ? 5.5 : activeEmotion === 'sleep' ? 1.4 : 2.5;
      const floatY = Math.sin(s.time * bounceSpeed) * bounceAmp * scale;
      const swayTilt = Math.sin(s.time * (bounceSpeed * 0.7)) * 0.05;

      ctx.translate(0, floatY);
      ctx.rotate(swayTilt);

      // ── 1. Twin-Tail Hair (Back Layer) ───────────────────────────────────
      const hairBounce = Math.sin(s.time * bounceSpeed + 0.4) * (activeEmotion === 'happy' ? 0.35 : 0.15);
      const hairColor = '#ff8fa3'; // Soft anime pink-rose
      const hairShadow = '#e05775';
      const hairHighlight = '#ffc2d1';

      // Left Twin-Tail
      ctx.save();
      ctx.translate(-26 * scale, -10 * scale);
      ctx.rotate(-0.35 + (activeEmotion === 'cry' ? 0.3 : hairBounce));
      const leftHairGrad = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 48 * scale);
      leftHairGrad.addColorStop(0, hairColor);
      leftHairGrad.addColorStop(0.7, hairShadow);
      leftHairGrad.addColorStop(1, '#c03958');
      ctx.fillStyle = leftHairGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-18 * scale, 22 * scale, -6 * scale, 48 * scale);
      ctx.quadraticCurveTo(8 * scale, 28 * scale, 4 * scale, 0);
      ctx.fill();
      ctx.restore();

      // Right Twin-Tail
      ctx.save();
      ctx.translate(26 * scale, -10 * scale);
      ctx.rotate(0.35 - (activeEmotion === 'cry' ? 0.3 : hairBounce));
      const rightHairGrad = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 48 * scale);
      rightHairGrad.addColorStop(0, hairColor);
      rightHairGrad.addColorStop(0.7, hairShadow);
      rightHairGrad.addColorStop(1, '#c03958');
      ctx.fillStyle = rightHairGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(18 * scale, 22 * scale, 6 * scale, 48 * scale);
      ctx.quadraticCurveTo(-8 * scale, 28 * scale, -4 * scale, 0);
      ctx.fill();
      ctx.restore();

      // ── 2. Doll Legs & Mary Jane Shoes ──────────────────────────────────
      const legColor = '#ffffff'; // White doll stockings
      const shoeColor = '#3b0764'; // Glossy purple Mary Jane shoes
      const legSwing = activeEmotion === 'sleep' ? 0 : Math.sin(s.time * bounceSpeed + 0.6) * 3 * scale;

      // Left Leg
      ctx.save();
      ctx.translate(-10 * scale, 34 * scale + legSwing);
      ctx.fillStyle = legColor;
      ctx.beginPath();
      ctx.roundRect(-3.5 * scale, 0, 7 * scale, 16 * scale, 3 * scale);
      ctx.fill();
      // Left Shoe
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-5 * scale, 12 * scale, 10 * scale, 7 * scale, 3 * scale);
      ctx.fill();
      // Buckle
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2 * scale, 13 * scale, 4 * scale, 2 * scale);
      ctx.restore();

      // Right Leg
      ctx.save();
      ctx.translate(10 * scale, 34 * scale - legSwing);
      ctx.fillStyle = legColor;
      ctx.beginPath();
      ctx.roundRect(-3.5 * scale, 0, 7 * scale, 16 * scale, 3 * scale);
      ctx.fill();
      // Right Shoe
      ctx.fillStyle = shoeColor;
      ctx.beginPath();
      ctx.roundRect(-5 * scale, 12 * scale, 10 * scale, 7 * scale, 3 * scale);
      ctx.fill();
      // Buckle
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2 * scale, 13 * scale, 4 * scale, 2 * scale);
      ctx.restore();

      // ── 3. Frilly Doll Dress & Ruffles ──────────────────────────────────
      ctx.save();
      ctx.translate(0, 18 * scale);

      // Pleated Doll Skirt
      const dressGrad = ctx.createLinearGradient(-22 * scale, -10 * scale, 22 * scale, 24 * scale);
      dressGrad.addColorStop(0, '#8b5cf6'); // Violet dress
      dressGrad.addColorStop(1, '#6d28d9');
      ctx.fillStyle = dressGrad;
      ctx.beginPath();
      ctx.moveTo(-14 * scale, -4 * scale);
      ctx.lineTo(-24 * scale, 18 * scale);
      ctx.quadraticCurveTo(0, 24 * scale, 24 * scale, 18 * scale);
      ctx.lineTo(14 * scale, -4 * scale);
      ctx.closePath();
      ctx.fill();

      // Frilly White Lace Hem
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let i = -24; i <= 24; i += 8) {
        ctx.arc(i * scale, 19 * scale, 3 * scale, 0, Math.PI);
      }
      ctx.fill();

      // Dress Bodice
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.roundRect(-14 * scale, -14 * scale, 28 * scale, 16 * scale, 4 * scale);
      ctx.fill();

      // White Doll Collar & Cute Ribbon Bow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-6 * scale, -12 * scale, 6 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
      ctx.ellipse(6 * scale, -12 * scale, 6 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute Pink Ribbon Bowtie
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(-4 * scale, -11 * scale, 4 * scale, 2.5 * scale, -0.4, 0, Math.PI * 2);
      ctx.ellipse(4 * scale, -11 * scale, 4 * scale, 2.5 * scale, 0.4, 0, Math.PI * 2);
      ctx.arc(0, -11 * scale, 2.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── 4. Articulated Doll Arms & Cute Hand Gestures ────────────────────
      const skinColor = '#fff1f2'; // Porcelain fair doll skin
      const skinBlush = '#fecdd3';

      if (activeEmotion === 'cute' || activeEmotion === 'happy') {
        // Hands doing Cute Heart / Cheering pose
        // Left Arm
        ctx.save();
        ctx.translate(-14 * scale, 10 * scale);
        const lAngle = activeEmotion === 'happy' ? -1.8 + Math.sin(s.time * 8) * 0.2 : -1.2;
        ctx.rotate(lAngle);
        // Sleeve
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(0, 0, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Arm
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.roundRect(-3 * scale, 0, 6 * scale, 14 * scale, 3 * scale);
        ctx.fill();
        // Hand
        ctx.beginPath();
        ctx.arc(0, 15 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right Arm
        ctx.save();
        ctx.translate(14 * scale, 10 * scale);
        const rAngle = activeEmotion === 'happy' ? 1.8 - Math.sin(s.time * 8) * 0.2 : 1.2;
        ctx.rotate(rAngle);
        // Sleeve
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(0, 0, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Arm
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.roundRect(-3 * scale, 0, 6 * scale, 14 * scale, 3 * scale);
        ctx.fill();
        // Hand
        ctx.beginPath();
        ctx.arc(0, 15 * scale, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (activeEmotion === 'cry') {
        // Hands rubbing eyes / wiping tears
        ctx.save();
        ctx.translate(-12 * scale, 8 * scale);
        ctx.rotate(-1.6 + Math.sin(s.time * 4) * 0.15);
        ctx.fillStyle = skinColor;
        ctx.roundRect(-3 * scale, 0, 6 * scale, 15 * scale, 3 * scale);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(12 * scale, 8 * scale);
        ctx.rotate(1.6 - Math.sin(s.time * 4) * 0.15);
        ctx.fillStyle = skinColor;
        ctx.roundRect(-3 * scale, 0, 6 * scale, 15 * scale, 3 * scale);
        ctx.fill();
        ctx.restore();
      } else {
        // Natural resting / speaking gesturing
        ctx.save();
        ctx.translate(-15 * scale, 8 * scale);
        const speakLAngle = activeEmotion === 'speaking' ? Math.sin(s.time * 7) * 0.35 + 0.2 : 0.15;
        ctx.rotate(speakLAngle);
        // Puffy Sleeve
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(0, 0, 5.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Arm & Hand
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.roundRect(-2.5 * scale, 0, 5 * scale, 16 * scale, 3 * scale);
        ctx.fill();
        ctx.arc(0, 16 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(15 * scale, 8 * scale);
        const speakRAngle = activeEmotion === 'speaking' ? -Math.sin(s.time * 8) * 0.4 - 0.2 : -0.15;
        ctx.rotate(speakRAngle);
        // Puffy Sleeve
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(0, 0, 5.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Arm & Hand
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.roundRect(-2.5 * scale, 0, 5 * scale, 16 * scale, 3 * scale);
        ctx.fill();
        ctx.arc(0, 16 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── 5. Doll Head & Face ───────────────────────────────────────────────
      ctx.save();
      const headLookX = s.currentLookX * 6 * scale;
      const headLookY = s.currentLookY * 4 * scale;
      const headTilt = activeEmotion === 'sleep' ? 0.25 : s.currentLookX * 0.1;

      ctx.translate(headLookX, -16 * scale + headLookY);
      ctx.rotate(headTilt);

      // Head Base / Porcelain Doll Face
      const faceGrad = ctx.createRadialGradient(0, -2 * scale, 4 * scale, 0, 0, 24 * scale);
      faceGrad.addColorStop(0, '#ffffff');
      faceGrad.addColorStop(0.7, skinColor);
      faceGrad.addColorStop(1, skinBlush);

      ctx.fillStyle = faceGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 23 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rosy Cheeks (Cute Blush)
      const blushOpacity = activeEmotion === 'cute' ? 0.75 : activeEmotion === 'cry' ? 0.4 : 0.55;
      ctx.fillStyle = `rgba(244, 63, 94, ${blushOpacity})`;
      ctx.beginPath();
      ctx.ellipse(-13 * scale, 5 * scale, 6 * scale, 3.5 * scale, 0.1, 0, Math.PI * 2);
      ctx.ellipse(13 * scale, 5 * scale, 6 * scale, 3.5 * scale, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Cute Blush Stripe Lines
      ctx.strokeStyle = `rgba(225, 29, 72, ${blushOpacity * 0.8})`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(-15 * scale, 4 * scale); ctx.lineTo(-12 * scale, 7 * scale);
      ctx.moveTo(-12 * scale, 4 * scale); ctx.lineTo(-9 * scale, 7 * scale);
      ctx.moveTo(10 * scale, 4 * scale);  ctx.lineTo(13 * scale, 7 * scale);
      ctx.moveTo(13 * scale, 4 * scale);  ctx.lineTo(16 * scale, 7 * scale);
      ctx.stroke();

      // ── Anime Eyes ───────────────────────────────────────────────────────
      const eyeOffsetX = s.currentLookX * 3.2 * scale;
      const eyeOffsetY = s.currentLookY * 2.2 * scale;

      if (activeEmotion === 'sleep' || s.isBlinking) {
        // Cute Closed Resting Crescent Eyes (^_^ / Zzz)
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 2.2 * scale;
        ctx.beginPath();
        ctx.arc(-9 * scale, 0, 6 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(9 * scale, 0, 6 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else if (activeEmotion === 'happy') {
        // Joyful Starry Curved Eyes (^▽^)
        ctx.strokeStyle = '#4c0519';
        ctx.lineWidth = 2.4 * scale;
        ctx.beginPath();
        ctx.arc(-9 * scale, -2 * scale, 6.5 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(9 * scale, -2 * scale, 6.5 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else {
        // Beautiful Big Anime Eyes with Layered Iris & Sparkles
        const drawEye = (ex) => {
          ctx.save();
          ctx.translate(ex, -1 * scale);

          // Eyelashes & Eye base
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, 6.5 * scale, 8 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Iris (Violet-Rose gradient)
          const irisGrad = ctx.createLinearGradient(0, -6 * scale, 0, 7 * scale);
          irisGrad.addColorStop(0, '#4c1d95');
          irisGrad.addColorStop(0.5, '#7c3aed');
          irisGrad.addColorStop(1, '#ec4899');
          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.ellipse(eyeOffsetX * 0.4, eyeOffsetY * 0.4, 5 * scale, 6.8 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(eyeOffsetX * 0.4, eyeOffsetY * 0.4, 2.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Big Sparkle Highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-2 * scale + eyeOffsetX * 0.2, -3 * scale + eyeOffsetY * 0.2, 2.4 * scale, 0, Math.PI * 2);
          ctx.fill();
          // Mini sparkle
          ctx.beginPath();
          ctx.arc(2 * scale + eyeOffsetX * 0.2, 2.5 * scale + eyeOffsetY * 0.2, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Upper Eyelash line
          ctx.strokeStyle = '#311042';
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.arc(0, -1 * scale, 6.5 * scale, Math.PI + 0.3, -0.3);
          ctx.stroke();
          ctx.restore();
        };

        drawEye(-9 * scale);
        drawEye(9 * scale);
      }

      // ── Cute Mouth ───────────────────────────────────────────────────────
      if (activeEmotion === 'speaking') {
        const mouthOpen = Math.abs(Math.sin(s.time * 12)) * 4.5 * scale + 1.5;
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(0, 9 * scale, 4 * scale, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeEmotion === 'happy') {
        // Big open joyful smile
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, 7 * scale, 4.5 * scale, 0, Math.PI);
        ctx.fill();
      } else if (activeEmotion === 'cry') {
        // Wobbly crying frown (n)
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 1.6 * scale;
        ctx.beginPath();
        ctx.arc(0, 11 * scale, 3.5 * scale, Math.PI + 0.4, -0.4);
        ctx.stroke();
      } else {
        // Sweet Gentle Smile (u)
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(0, 8 * scale, 3 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // ── Front Bangs & Cute Ribbon Bows ────────────────────────────────────
      // Cute Ribbon Bows on twin tails
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      // Left Bow
      ctx.ellipse(-20 * scale, -16 * scale, 4 * scale, 2.5 * scale, -0.3, 0, Math.PI * 2);
      ctx.ellipse(-23 * scale, -13 * scale, 4 * scale, 2.5 * scale, 0.4, 0, Math.PI * 2);
      ctx.arc(-21 * scale, -14 * scale, 2 * scale, 0, Math.PI * 2);
      // Right Bow
      ctx.ellipse(20 * scale, -16 * scale, 4 * scale, 2.5 * scale, 0.3, 0, Math.PI * 2);
      ctx.ellipse(23 * scale, -13 * scale, 4 * scale, 2.5 * scale, -0.4, 0, Math.PI * 2);
      ctx.arc(21 * scale, -14 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Anime Bangs & Hair Fringe
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(0, -3 * scale, 24 * scale, Math.PI, 0); // Top skull hair
      // Bang strands
      ctx.quadraticCurveTo(16 * scale, -4 * scale, 12 * scale, 2 * scale);
      ctx.quadraticCurveTo(6 * scale, -8 * scale, 0, 1 * scale);
      ctx.quadraticCurveTo(-6 * scale, -8 * scale, -12 * scale, 2 * scale);
      ctx.quadraticCurveTo(-16 * scale, -4 * scale, -24 * scale, -3 * scale);
      ctx.closePath();
      ctx.fill();

      // Hair Highlight Gloss Band
      ctx.strokeStyle = hairHighlight;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(0, -10 * scale, 19 * scale, Math.PI + 0.5, -0.5);
      ctx.stroke();

      ctx.restore(); // Head
      ctx.restore(); // Base translate

      // ── 6. Render Floating Particles (Hearts, Tears, Zzz, Stars) ──────────
      s.particles.forEach((p) => {
        ctx.save();
        ctx.translate(cx + p.x * scale, cy + p.y * scale);
        ctx.globalAlpha = p.opacity;
        ctx.scale(p.scale * scale, p.scale * scale);

        if (p.type === 'heart') {
          // Floating Red/Pink Love Heart ♥
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(0, 3);
          ctx.bezierCurveTo(-5, -4, -10, 2, 0, 10);
          ctx.bezierCurveTo(10, 2, 5, -4, 0, 3);
          ctx.fill();
        } else if (p.type === 'tear') {
          // Crying Tear Drops 💧
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 4, 3, 0, Math.PI);
          ctx.lineTo(0, -4);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'zzz') {
          // Sleeping "Zzz" bubble 💤
          ctx.fillStyle = '#818cf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('Z', 0, 0);
        } else if (p.type === 'star') {
          // Happy / Thinking Golden Star ⭐
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [mode, currentMood, interactive]);

  const handleClick = (e) => {
    // Spin and rotate through cute emotions!
    stateRef.current.spinVelocity = 0.35;
    const moodCycle = ['cute', 'happy', 'cry', 'sleep'];
    const nextMoodIndex = (moodCycle.indexOf(currentMood) + 1) % moodCycle.length;
    setCurrentMood(moodCycle[nextMoodIndex]);

    if (onClick) onClick(e, moodCycle[nextMoodIndex]);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Girl Doll Canvas */}
      <div
        onClick={handleClick}
        className="inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-108 active:scale-95"
        style={{ width: size, height: size }}
        title={`3D Anime Girl Doll (${currentMood}) — Click to interact & switch emotion!`}
      >
        <canvas
          ref={canvasRef}
          width={size * 2}
          height={size * 2}
          style={{ width: size, height: size }}
          className="drop-shadow-xl"
        />
      </div>

      {/* Emotion Switcher Pills (Optional UI controls) */}
      {showControls && (
        <div className="flex items-center gap-1 mt-2 p-1 bg-surface-sunken/60 rounded-full border border-line">
          {[
            { id: 'cute', label: 'Cute ♥', emoji: '🥰' },
            { id: 'happy', label: 'Happy', emoji: '✨' },
            { id: 'cry', label: 'Cry', emoji: '🥺' },
            { id: 'sleep', label: 'Sleep', emoji: '😴' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentMood(item.id)}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-full transition-all ${
                currentMood === item.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
