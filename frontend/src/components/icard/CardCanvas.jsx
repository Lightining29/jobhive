import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCw, 
  Wifi, 
  Download, 
  Share2, 
  Layers, 
  Sparkles, 
  Eye, 
  ScanLine, 
  Maximize2,
  Columns
} from 'lucide-react';
import CardFront from './CardFront';
import CardBack from './CardBack';
import { downloadVCardFile } from '../../utils/vcard';

export default function CardCanvas({ card, theme, onOpenExport, onOpenShare }) {
  const [viewMode, setViewMode] = useState('3d-flip'); // '3d-flip' | 'dual-side'
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [nfcTapped, setNfcTapped] = useState(false);

  const cardRef = useRef(null);
  const isVertical = card.orientation === 'vertical';

  // Handle 3D Tilt mouse movement
  const handleMouseMove = (e) => {
    if (!cardRef.current || viewMode !== '3d-flip') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  // Simulate NFC Tap interaction
  const handleNfcTap = () => {
    setNfcTapped(true);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#a855f7', '#fbbf24', '#ffffff']
    });
    setTimeout(() => setNfcTapped(false), 1500);
  };

  // Standard 100% Dimensions (Exact CR80 ISO 7810 54mm x 85.6mm Aspect Ratio 1:1.585)
  const cardSizeClasses = isVertical 
    ? 'w-[320px] sm:w-[350px] h-[507px] sm:h-[555px] max-w-[92vw]' 
    : 'w-[480px] sm:w-[540px] h-[303px] sm:h-[341px] max-w-[92vw]';

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[540px] p-2 md:p-6 relative">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-3xl mb-5 z-10 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-200 font-bold uppercase tracking-wider">
            {theme?.name || 'Badge'} • {isVertical ? 'CR80 Vertical (54×85.6mm)' : 'CR80 Smart Card'}
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Front / Back / Dual View */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setViewMode('3d-flip');
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d-flip' && !isFlipped
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Front
            </button>

            <button
              onClick={() => {
                setViewMode('3d-flip');
                setIsFlipped(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d-flip' && isFlipped
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Back Face
            </button>

            <button
              onClick={() => setViewMode('dual-side')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'dual-side'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual View</span>
            </button>
          </div>

          <button
            onClick={handleNfcTap}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
              nfcTapped 
                ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300' 
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Simulate NFC Tap contact transfer"
          >
            <Wifi className="w-3.5 h-3.5 rotate-90" />
            <span>{nfcTapped ? 'NFC Connected!' : 'Tap NFC'}</span>
          </button>
        </div>
      </div>

      {/* DUAL SIDE VIEW (Side by Side) */}
      {viewMode === 'dual-side' ? (
        <div className="flex flex-wrap items-center justify-center gap-6 my-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Front Card Container */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Front Side
            </span>
            <div className={`shadow-2xl hover:scale-[1.02] transition-transform duration-200 ${cardSizeClasses}`}>
              <CardFront card={card} theme={theme} id="card-front-face" />
            </div>
          </div>

          {/* Back Card Container */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Back Side
            </span>
            <div className={`shadow-2xl hover:scale-[1.02] transition-transform duration-200 ${cardSizeClasses}`}>
              <CardBack card={card} theme={theme} id="card-back-face" />
            </div>
          </div>
        </div>
      ) : (
        /* 3D PERSPECTIVE FLIP STAGE */
        <div 
          className="perspective-1200 flex items-center justify-center relative cursor-grab active:cursor-grabbing my-4"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={cardRef}
            className={`transform-style-3d transition-transform duration-200 ease-out relative ${cardSizeClasses}`}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg)`
            }}
          >
            {/* Front Face */}
            <div className="absolute inset-0 backface-hidden">
              <CardFront card={card} theme={theme} id="card-front-face" />
              <div 
                className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-150"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}), transparent 60%)`,
                  mixBlendMode: 'overlay'
                }}
              />
            </div>

            {/* Back Face */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <CardBack card={card} theme={theme} id="card-back-face" />
              <div 
                className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-150"
                style={{
                  background: `radial-gradient(circle at ${100 - glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}), transparent 60%)`,
                  mixBlendMode: 'overlay'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick Action & Export Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 z-10">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 shadow-lg hover:border-slate-600 transition-all hover:scale-105"
        >
          <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
          <span>{isFlipped ? 'Flip to Front' : 'Flip to Back'}</span>
        </button>

        <button
          onClick={() => downloadVCardFile(card)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 shadow-lg hover:border-slate-600 transition-all hover:scale-105"
        >
          <ScanLine className="w-4 h-4 text-cyan-400" />
          <span>Download vCard (.vcf)</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Export HD & Print (PDF/PNG)</span>
        </button>

        <button
          onClick={onOpenShare}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 shadow-lg hover:border-slate-600 transition-all hover:scale-105"
        >
          <Share2 className="w-4 h-4 text-pink-400" />
          <span>Share Link / QR</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5 font-mono">
        <Sparkles className="w-3 h-3 text-indigo-400" /> Proportional CR80 Print ISO 7810 format (85.6 × 54 mm)
      </p>
    </div>
  );
}
