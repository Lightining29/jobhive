import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Wifi, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  Sparkles,
  Home,
  Hexagon,
  Box,
  Building,
  HeartPulse
} from 'lucide-react';
import { generateVCardString } from '../../utils/vcard';

export default function CardFront({ card, theme, id = "card-front-face" }) {
  const themeId = theme?.id || card.theme?.themeId || 'corporate-diagonal';
  const layout = theme?.layoutType || card.layoutType || themeId;
  const colors = theme?.colors || {};
  const typography = theme?.typography || {};

  const getQrValue = () => {
    if (card.qrSettings?.targetType === 'vcard') {
      return generateVCardString(card);
    }
    if (card.qrSettings?.targetType === 'custom' && card.qrSettings?.customUrl) {
      return card.qrSettings.customUrl;
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jobhive.app';
    const cardId = card._id || card.id || card.personal?.idNumber || 'preview';
    return `${baseUrl}/verify-card/${cardId}`;
  };

  const qrValue = getQrValue();

  // SVG Barcode Renderer
  const Barcode = ({ number = "1234567890", height = "h-8", showDigits = true, textColor = "text-slate-800", customClass = "" }) => (
    <div className={`flex flex-col items-center ${customClass}`}>
      <div className={`${height} flex items-center justify-center gap-[2.5px] bg-white p-1 rounded`}>
        {String(number).split('').map((char, idx) => {
          const width = (char.charCodeAt(0) % 3) + 1.2;
          return <div key={idx} className="bg-black h-full" style={{ width: `${width}px` }} />;
        })}
      </div>
      {showDigits && (
        <span className={`text-[10px] font-mono tracking-widest ${textColor} mt-1 font-bold leading-normal`}>
          {number}
        </span>
      )}
    </div>
  );

  // =========================================================================
  // 1. CORPORATE BLUE DIAGONAL (Image 1: Christian Martin)
  // =========================================================================
  if (themeId === 'corporate-diagonal' || layout === 'corporate-diagonal') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        {/* Top Dark Navy Diagonal Polygonal Cut Header (Pure SVG Vector) */}
        <div className="relative h-48 w-full overflow-hidden">
          <svg viewBox="0 0 400 200" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
            <polygon points="0,0 400,0 400,135 0,200" fill="#071d36" />
            <polygon points="200,0 400,0 400,100 0,200" fill="#00b4d8" opacity="0.3" />
          </svg>

          {/* Top-Right Logo */}
          <div className="absolute top-4 right-4 z-10 text-right text-white flex flex-col items-end">
            <div className="flex items-center gap-0.5 mb-0.5">
              <Hexagon className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
              <Hexagon className="w-5 h-5 -ml-3 text-white/90 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase font-mono text-white leading-normal">
              {card.personal?.organization || 'LOGO'}
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase font-mono text-slate-300 leading-normal">
              HERE
            </span>
          </div>

          {/* Circular Avatar */}
          <div className="absolute bottom-2 left-6 z-20">
            <div className="w-24 h-24 rounded-full p-1 bg-white shadow-xl flex items-center justify-center">
              <img
                src={card.media?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full bg-slate-200"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* Center Details */}
        <div className="px-6 flex-grow flex flex-col justify-center space-y-2.5 pt-1">
          <div>
            <h2 className="text-xl font-black text-[#071d36] tracking-tight uppercase leading-snug truncate">
              {card.personal?.fullName || 'CHRISTIAN MARTIN'}
            </h2>
            <p className="text-xs font-bold text-[#00b4d8] tracking-[0.2em] uppercase mt-0.5 leading-normal truncate">
              {card.personal?.jobTitle || 'GRAPHIC DESIGNER'}
            </p>
          </div>

          <div className="space-y-1.5 text-xs font-bold text-slate-700 leading-normal">
            <div className="flex items-center">
              <span className="w-20 text-slate-900 font-extrabold flex-shrink-0">Gender</span>
              <span className="mr-3 font-extrabold">:</span>
              <span className="font-semibold text-slate-700">{card.personal?.gender || 'Male'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-slate-900 font-extrabold flex-shrink-0">DOB</span>
              <span className="mr-3 font-extrabold">:</span>
              <span className="font-semibold text-slate-700">{card.personal?.dob || '01-10-21'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-slate-900 font-extrabold flex-shrink-0">Phone</span>
              <span className="mr-3 font-extrabold">:</span>
              <span className="font-semibold text-slate-700">{card.contact?.phone || '123 456 789'}</span>
            </div>
            <div className="flex items-start">
              <span className="w-20 text-slate-900 font-extrabold flex-shrink-0">E-mail</span>
              <span className="mr-3 font-extrabold">:</span>
              <span className="font-semibold text-slate-700 break-all text-[11px] leading-tight flex-1">{card.contact?.email || 'info@appletreeinfotech.in'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Dark Navy Diagonal Bar (Pure SVG) */}
        <div className="relative h-14 overflow-hidden">
          <svg viewBox="0 0 400 70" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
            <polygon points="0,25 400,0 400,70 0,70" fill="#071d36" />
          </svg>
          <div className="relative z-10 w-full h-full flex items-center justify-center text-white font-extrabold font-mono tracking-widest text-sm pt-2">
            ID NO:{card.personal?.idNumber || '1234567890'}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MODERN GOLD GEOMETRIC BADGE (Image 2: Jamie Jhonson)
  // =========================================================================
  if (themeId === 'modern-gold-badge' || layout === 'modern-gold-badge') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-[1.75rem] p-0"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Punch Slot */}
        <div className="relative z-30 pt-3.5 px-6 flex justify-center">
          <div className="w-16 h-3 rounded-full bg-slate-200/90 border border-slate-300 shadow-inner" />
        </div>

        {/* Logo & Header */}
        <div className="flex items-center gap-3 relative z-20 px-6 pt-1">
          <div className="relative w-9 h-9 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1b1c3a" strokeWidth="5" strokeDasharray="60 30" transform="rotate(-45 18 18)" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="40 50" transform="rotate(135 18 18)" />
              <circle cx="18" cy="18" r="4" fill="#1b1c3a" />
            </svg>
          </div>
          <div>
            <h4 className="text-[11px] font-black text-[#1b1c3a] uppercase leading-tight tracking-wider font-mono">
              {card.personal?.organization || 'COMPANY NAME'}
            </h4>
            <span className="text-[9.5px] font-extrabold text-[#1b1c3a] uppercase tracking-wider font-mono block leading-tight">
              {card.personal?.department || 'MANAGEMENT DIVISION'}
            </span>
          </div>
        </div>

        {/* Profile Avatar & Identity */}
        <div className="flex flex-col items-center text-center my-auto py-1 px-6 relative z-20">
          <div className="w-36 h-40 rounded-2xl overflow-hidden shadow-2xl border-[3.5px] border-white mb-2.5 bg-slate-200">
            <img
              src={card.media?.avatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>

          <h2 className="text-2xl font-black text-[#1b1c3a] uppercase tracking-wide truncate max-w-full leading-tight">
            {card.personal?.fullName || 'JAMIE JHONSON'}
          </h2>
          <div className="w-56 h-[2px] bg-[#1b1c3a] my-1.5" />
          <p className="text-xs font-black text-[#1b1c3a] uppercase tracking-[0.18em] leading-tight">
            {card.personal?.jobTitle || 'ASSISTANT MANAGER'}
          </p>
        </div>

        {/* Bottom Barcode with Bottom Left Yellow Angle */}
        <div className="relative pb-4 px-6 flex items-center justify-center z-20">
          <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="0,50 100,100 0,100" fill="#fde68a" />
              <polygon points="0,75 100,100 0,100" fill="#e2e8f0" opacity="0.8" />
            </svg>
          </div>

          <div className="relative z-10">
            <Barcode number={card.security?.barcodeNumber || "89845653208871"} height="h-9" textColor="text-[#1b1c3a]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. FLUID CYAN WAVES (Image 3: Anna Roe)
  // =========================================================================
  if (themeId === 'fluid-cyan-waves' || layout === 'fluid-cyan-waves') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="absolute top-0 left-0 right-0 h-44 overflow-hidden pointer-events-none z-10">
          <svg viewBox="0 0 400 180" className="w-full h-full object-cover" preserveAspectRatio="none">
            <path d="M0,0 L400,0 L400,90 C300,150 150,20 0,130 Z" fill="#0077b6" />
            <path d="M0,0 L260,0 C190,70 80,20 0,150 Z" fill="#00b4d8" opacity="0.85" />
            <path d="M0,20 C120,90 280,10 400,60 L400,0 L0,0 Z" fill="#03045e" opacity="0.75" />
          </svg>
        </div>

        <div className="relative z-20 flex justify-end items-center pt-4 pr-5">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <div className="w-5 h-5 rounded-md bg-[#00b4d8] transform rotate-45 flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-sm bg-white" />
              </div>
              <span className="text-xs font-black text-slate-900 tracking-wider leading-normal">
                {card.personal?.organization || 'LOGO NAME'}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium block leading-normal">
              {card.personal?.tagline || 'Slogan Goes Here'}
            </span>
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center my-auto pt-1 px-5">
          <div className="w-24 h-24 rounded-full p-1 bg-white shadow-2xl mb-2">
            <img
              src={card.media?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
              crossOrigin="anonymous"
            />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase truncate max-w-full leading-normal">
            {card.personal?.fullName || 'ANNA ROE'}
          </h2>
          <p className="text-xs font-bold text-[#0077b6] tracking-wider mt-0.5 leading-normal">
            {card.personal?.jobTitle || 'Web Developer'}
          </p>

          <div className="w-48 h-[1.5px] bg-slate-200 my-2" />

          <p className="text-xs font-extrabold text-slate-800 font-mono leading-normal">
            ID : {card.personal?.idNumber || '01930381085'}
          </p>

          <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono mt-1 font-semibold leading-normal">
            <span>Date of Issue: <strong className="text-slate-900">{card.personal?.issueDate || '01-01-2024'}</strong></span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px] text-slate-700 font-mono mt-2 pt-2 border-t border-slate-100 w-full max-w-[280px] leading-normal">
            <div><span className="text-slate-400">P:</span> {card.contact?.phone || '+91 98765 43210'}</div>
            <div className="break-all"><span className="text-slate-400">E:</span> {card.contact?.email || 'info@appletreeinfotech.in'}</div>
            <div><span className="text-slate-400">Dep:</span> {card.personal?.department || 'Engineering'}</div>
            <div><span className="text-slate-400">Blood:</span> {card.personal?.bloodGroup || 'O+'}</div>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-between p-5 pt-0">
          <div className="p-1.5 rounded-xl bg-white shadow-xl border border-slate-200">
            <QRCodeSVG value={qrValue} size={48} fgColor="#0077b6" />
          </div>

          <div className="w-40 h-24 absolute bottom-0 right-0 pointer-events-none">
            <svg viewBox="0 0 150 90" className="w-full h-full">
              <path d="M0,90 C60,20 100,70 150,10 L150,90 Z" fill="#00b4d8" />
              <path d="M30,90 C80,40 120,80 150,30 L150,90 Z" fill="#0077b6" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. LIGHT REAL ESTATE (Image 4: Amy Williams)
  // =========================================================================
  if (themeId === 'dark-real-estate' || layout === 'dark-real-estate') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-slate-50 text-slate-900 shadow-2xl rounded-2xl p-0 border border-slate-200"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="absolute top-10 left-4 text-blue-600 font-mono text-sm tracking-tighter">{'>>>'}</div>
          <div className="absolute top-24 right-4 text-blue-600 font-mono text-sm tracking-tighter">{'>>>'}</div>
          <div className="absolute bottom-20 left-6 text-blue-600 font-mono text-sm tracking-tighter">{'>>>'}</div>
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex flex-col items-center text-center pt-4 px-5">
          <div className="flex items-center gap-1.5 text-[#071d36]">
            <Home className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-black tracking-[0.2em] uppercase font-mono leading-normal">
              {card.personal?.organization || 'LOGO HOUSE'}
            </span>
          </div>
        </div>

        {/* Center Profile & Identity */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto py-1 px-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-xl shadow-blue-500/20 mb-2">
            <img
              src={card.media?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
              crossOrigin="anonymous"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-wider text-[#071d36] uppercase truncate max-w-full leading-tight">
            {card.personal?.fullName || 'AMY WILLIAMS'}
          </h2>
          <p className="text-[11px] font-bold text-blue-600 tracking-[0.18em] uppercase mt-0.5 leading-tight">
            {card.personal?.jobTitle || 'JOB POSITION'}
          </p>

          {/* Detailed Contact, ID & Validity Ledger */}
          <div className="w-full max-w-[280px] mt-2 p-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-sm space-y-1 text-[9.5px] font-mono text-slate-700 leading-normal">
            <div className="flex justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold">ID No:</span>
              <strong className="text-blue-700 font-bold">{card.personal?.idNumber || '334265'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold">Phone:</span>
              <strong className="text-slate-900">{card.contact?.phone || '+1 800 555 0192'}</strong>
            </div>
            <div className="flex items-start justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold flex-shrink-0 mr-2">Email:</span>
              <strong className="text-slate-900 break-all text-[8.5px] leading-tight text-right flex-1">{card.contact?.email || 'info@appletreeinfotech.in'}</strong>
            </div>
            <div className="flex justify-between text-[9px] pt-0.5 text-slate-600 font-bold font-mono">
              <span>Date of Issue:</span>
              <span className="text-slate-900">{card.personal?.issueDate || '01-01-2024'}</span>
            </div>
          </div>

          <div className="mt-2 text-center flex flex-col items-center">
            <span className="text-[9px] text-slate-400 block font-mono font-bold">Signature:</span>
            <div className="py-1">
              <img
                src={card.media?.signatureUrl || "/assets/signature.png"}
                alt="Authorized Signature"
                className="h-12 max-w-[160px] object-contain drop-shadow-md scale-105"
                crossOrigin="anonymous"
              />
            </div>
            <div className="w-36 h-[1.5px] bg-slate-300 mx-auto mt-0.5" />
          </div>
        </div>

        <div className="relative z-10 bg-gradient-to-r from-[#071d36] via-[#0d2c54] to-[#071d36] py-2.5 text-center font-black tracking-[0.25em] uppercase text-xs text-white font-mono shadow-md leading-normal">
          {card.personal?.department || 'DEPARTMENT'}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. CHEVRON SIDEBAR (Image 5: Christian Martin)
  // =========================================================================
  if (themeId === 'chevron-sidebar' || layout === 'chevron-sidebar') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="w-16 bg-[#0066cc] flex flex-col items-center justify-between py-5 text-white flex-shrink-0">
          <div className="space-y-1.5">
            <div className="w-8 h-2 border-t-[3px] border-r-[3px] border-white transform -rotate-45" />
            <div className="w-8 h-2 border-t-[3px] border-r-[3px] border-white transform -rotate-45" />
          </div>

          <div className="transform -rotate-90 whitespace-nowrap tracking-wider font-extrabold uppercase text-[11px] font-mono leading-normal">
            {card.personal?.fullName || 'CHRISTIAN MARTIN'} • {card.personal?.jobTitle || 'GRAPHIC DESIGNER'}
          </div>

          <div className="w-4 h-1 bg-white rounded-full" />
        </div>

        <div className="flex-grow flex flex-col justify-between p-5 pl-4">
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-0.5">
              <Hexagon className="w-5 h-5 text-[#0066cc] stroke-[2.5]" />
              <Hexagon className="w-5 h-5 -ml-3 text-slate-400 stroke-[2.5]" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-black text-[#0066cc] uppercase leading-normal font-mono">
                {card.personal?.organization || 'COMPANY NAME'}
              </h4>
              <span className="text-[8px] text-slate-500 tracking-widest uppercase font-bold leading-normal">
                {card.personal?.tagline || 'TAGLINE HERE'}
              </span>
            </div>
          </div>

          <div className="flex justify-center my-2">
            <div className="w-28 h-32 bg-slate-200 border-[3px] border-white shadow-xl rounded overflow-hidden">
              <img
                src={card.media?.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80"}
                alt="Avatar"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-bold text-slate-700 pb-1 leading-normal">
            <div className="flex border-b border-slate-100 pb-1">
              <span className="w-20 font-black text-slate-900">Gender:</span>
              <span className="font-semibold">{card.personal?.gender || 'Male'}</span>
            </div>
            <div className="flex border-b border-slate-100 pb-1">
              <span className="w-20 font-black text-slate-900">DOB:</span>
              <span className="font-semibold">{card.personal?.dob || '01-10-21'}</span>
            </div>
            <div className="flex border-b border-slate-100 pb-1">
              <span className="w-20 font-black text-slate-900">Phone:</span>
              <span className="font-semibold">{card.contact?.phone || '123 456 789'}</span>
            </div>
            <div className="flex border-b border-slate-100 pb-1">
              <span className="w-20 font-black text-slate-900 flex-shrink-0">E-mail:</span>
              <span className="font-semibold break-all text-[11px] leading-tight flex-1">{card.contact?.email || 'info@appletreeinfotech.in'}</span>
            </div>
            <div className="flex">
              <span className="w-20 font-black text-slate-900">Blood G:</span>
              <span className="text-red-600 font-extrabold">{card.personal?.bloodGroup || 'AB+'}</span>
            </div>
          </div>

          <div className="bg-[#004080] text-white py-2.5 px-4 text-center text-xs font-black font-mono tracking-widest rounded-sm leading-normal">
            ID NO:{card.personal?.idNumber || '1234567890'}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. STYLISH BLUE CURVES (Image 6: John Carver)
  // =========================================================================
  if (themeId === 'stylish-blue-curves' || layout === 'stylish-blue-curves') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden z-10">
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover" preserveAspectRatio="none">
            <path d="M0,0 L400,0 L400,120 C280,180 120,40 0,140 Z" fill="#0284c7" />
            <path d="M0,0 L350,0 C240,110 90,30 0,160 Z" fill="#0c4a6e" />
          </svg>
        </div>

        <div className="relative z-20 flex items-center gap-2 pt-4 px-5">
          <div className="w-7 h-7 rounded bg-[#38bdf8] transform rotate-12 flex items-center justify-center text-white shadow-md">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider leading-normal">
              {card.personal?.organization || 'COMPANY LOGO'}
            </h4>
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center text-center my-auto pt-2 px-5">
          <div className="w-24 h-24 rounded-full p-1.5 bg-white shadow-2xl mb-3">
            <img
              src={card.media?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
              crossOrigin="anonymous"
            />
          </div>

          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight truncate max-w-full leading-normal">
            {card.personal?.fullName || 'JOHN CARVER'}
          </h2>
          <p className="text-xs font-bold text-[#0284c7] uppercase tracking-wider mt-0.5 leading-normal">
            {card.personal?.jobTitle || 'CREATIVE MANAGER'}
          </p>

          <div className="space-y-1 text-xs font-semibold text-slate-700 mt-3 text-left w-full max-w-[220px] leading-normal">
            <div className="flex justify-between">
              <span className="text-slate-900 font-bold">ID No</span>
              <span>: {card.personal?.idNumber || '000 000 000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-900 font-bold">DOB</span>
              <span>: {card.personal?.dob || 'MM/DD/YEAR'}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-slate-900 font-bold flex-shrink-0 mr-2">Email:</span>
              <span className="break-all text-[10px] leading-tight text-right flex-1">{card.contact?.email || 'info@appletreeinfotech.in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-900 font-bold">Phone</span>
              <span>: {card.contact?.phone || '+00 000 000'}</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 pb-4 px-5 flex items-center justify-between">
          <Barcode number={card.security?.barcodeNumber || "000000000"} height="h-8" textColor="text-slate-700" />
          
          <div className="w-20 h-14 absolute bottom-0 right-0 pointer-events-none">
            <svg viewBox="0 0 100 80" className="w-full h-full">
              <path d="M0,80 C40,30 80,60 100,10 L100,80 Z" fill="#38bdf8" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. CLEAN NAVY & SLATE WEDGE (Image 7: Austin Ortiz) — 100% PURE SVG GEOMETRY
  // =========================================================================
  if (themeId === 'clean-geometric-wedge' || layout === 'clean-geometric-wedge') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
        style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        {/* Top Header Bar with Pure SVG Slanted Slate Wedge */}
        <div className="relative h-16 bg-[#0b1d3a] flex items-center justify-between px-6 text-white overflow-hidden flex-shrink-0">
          <span className="text-xs font-black tracking-[0.2em] uppercase font-mono leading-normal relative z-10">
            {card.personal?.organization || 'COMPANYNAME'}
          </span>

          {/* SVG Vector Wedge */}
          <svg viewBox="0 0 120 64" className="absolute top-0 right-0 w-28 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="38,0 120,0 120,64 0,64" fill="#3b6fb6" />
          </svg>
        </div>

        {/* Center Content Area */}
        <div className="flex flex-col items-center my-auto py-2 px-6">
          <div className="w-36 h-40 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-100 mb-2.5 bg-slate-200 flex-shrink-0">
            <img
              src={card.media?.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>

          <h2 className="text-2xl font-black text-[#0b1d3a] tracking-tight truncate max-w-full leading-normal py-0.5">
            {card.personal?.fullName || 'Austin Ortiz'}
          </h2>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.18em] leading-normal">
            {card.personal?.jobTitle || 'MARKETING MANAGER'}
          </p>

          <div className="space-y-1.5 text-xs font-bold text-slate-700 mt-3 text-left w-full max-w-[240px] leading-normal">
            <div className="flex items-center">
              <span className="w-20 font-black text-[#0b1d3a] flex-shrink-0">ID No</span>
              <span className="mr-3 font-black">:</span>
              <span className="font-mono font-semibold truncate">{card.personal?.idNumber || '0000060816'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 font-black text-[#0b1d3a] flex-shrink-0">DOB</span>
              <span className="mr-3 font-black">:</span>
              <span className="font-semibold truncate">{card.personal?.dob || '06/08/16'}</span>
            </div>
            <div className="flex items-start">
              <span className="w-20 font-black text-[#0b1d3a] flex-shrink-0">Email</span>
              <span className="mr-3 font-black">:</span>
              <span className="font-semibold break-all text-[11px] leading-tight flex-1">{card.contact?.email || 'info@appletreeinfotech.in'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 font-black text-[#0b1d3a] flex-shrink-0">Phone</span>
              <span className="mr-3 font-black">:</span>
              <span className="font-semibold truncate">{card.contact?.phone || '946 385 921'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Symmetrical Vector Slate Blue Wedge & Navy Footer */}
        <div className="relative h-14 bg-[#0b1d3a] overflow-hidden flex-shrink-0">
          <svg viewBox="0 0 130 56" className="absolute top-0 left-0 w-32 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="0,0 130,0 92,56 0,56" fill="#3b6fb6" />
          </svg>
        </div>
      </div>
    );
  }

  // Default Smart Card
  return (
    <div
      id={id}
      className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between p-5 bg-slate-900 text-white rounded-2xl"
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <h4 className="font-bold text-sm uppercase leading-normal">{card.personal?.organization || 'Organization'}</h4>
        <Wifi className="w-4 h-4 text-cyan-400 rotate-90" />
      </div>
      <div className="my-auto text-center">
        <h2 className="text-lg font-bold leading-normal">{card.personal?.fullName}</h2>
        <p className="text-xs text-cyan-400 font-semibold uppercase leading-normal">{card.personal?.jobTitle}</p>
      </div>
      <div className="flex justify-between text-xs font-mono text-slate-400 border-t border-white/10 pt-2 leading-normal">
        <span>ID: {card.personal?.idNumber || '12345'}</span>
        <span>{card.contact?.phone || ''}</span>
      </div>
    </div>
  );
}
