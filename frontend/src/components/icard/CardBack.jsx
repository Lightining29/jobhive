import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Lock, 
  Sparkles, 
  Box,
  Building,
  ShieldAlert,
  ShieldCheck,
  HeartPulse,
  PhoneCall
} from 'lucide-react';
import { generateVCardString } from '../../utils/vcard';

export default function CardBack({ card, theme, id = "card-back-face" }) {
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
    <div className={`flex flex-col items-center w-full ${customClass}`}>
      <div className={`${height} flex items-center justify-center gap-[2px] bg-white p-1 rounded w-full max-w-[240px]`}>
        {String(number).split('').map((char, idx) => {
          const width = (char.charCodeAt(0) % 3) + 1.2;
          return <div key={idx} className="bg-black h-full" style={{ width: `${width}px` }} />;
        })}
      </div>
      {showDigits && (
        <span className={`text-[9.5px] font-mono tracking-widest ${textColor} mt-0.5 font-bold leading-normal`}>
          {number}
        </span>
      )}
    </div>
  );

  // =========================================================================
  // 1. CORPORATE BLUE DIAGONAL (Image 1 Back)
  // =========================================================================
  if (themeId === 'corporate-diagonal' || layout === 'corporate-diagonal') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        <div className="w-14 sm:w-16 bg-[#071d36] flex items-center justify-center relative overflow-hidden flex-shrink-0">
          <span className="transform -rotate-90 whitespace-nowrap text-white font-black text-sm tracking-[0.25em] uppercase font-mono leading-normal">
            IDENTITY CARD
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between p-3.5 sm:p-4">
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-black text-[#071d36] tracking-tight leading-normal">
              Terms & Conditions
            </h3>
            <ul className="space-y-1 text-[8px] sm:text-[8.5px] text-slate-700 leading-tight list-disc pl-3 font-medium">
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.</li>
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.</li>
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.</li>
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.</li>
            </ul>

            <div className="space-y-0.5 text-[9.5px] font-bold text-slate-800 pt-2 border-t border-slate-100 font-mono leading-normal">
              <div className="flex items-center">
                <span className="w-20 text-slate-900 font-black flex-shrink-0">Issue date</span>
                <span className="mr-1.5">:</span>
                <span className="truncate">{card.personal?.issueDate || '00-00-0000'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-slate-900 font-black flex-shrink-0">Expiry date</span>
                <span className="mr-1.5">:</span>
                <span className="truncate">{card.personal?.expiryDate || '00-00-0000'}</span>
              </div>
            </div>
          </div>

          <div className="relative h-16 -mr-3.5 -mb-3.5 sm:-mr-4 sm:-mb-4 mt-2 overflow-hidden">
            <svg viewBox="0 0 200 65" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
              <polygon points="0,25 200,0 200,65 0,65" fill="#0077b6" />
            </svg>
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white text-center pt-2">
              <p className="font-serif italic text-sm text-white font-bold leading-none">
                {card.personal?.signatureText || 'Sign here'}
              </p>
              <div className="w-24 h-[1px] bg-white/80 mx-auto my-1" />
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-white/95 block leading-none">
                {card.personal?.directorName || 'Director'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MODERN GOLD GEOMETRIC BADGE (Image 2 Back: Jamie Jhonson)
  // =========================================================================
  if (themeId === 'modern-gold-badge' || layout === 'modern-gold-badge') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-[1.75rem] p-0"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="relative pt-4 px-6">
          <div className="w-16 h-3.5 rounded-full bg-slate-200/90 mx-auto border border-slate-300 shadow-inner relative z-30" />

          <div className="absolute top-0 left-0 w-48 h-40 pointer-events-none overflow-hidden z-10">
            <svg viewBox="0 0 200 180" className="w-full h-full transform scale-x-[-1]">
              <polygon points="40,0 200,0 200,180 90,180" fill="#1b1c3a" />
              <polygon points="120,0 200,0 200,60 80,0" fill="#d97706" />
              <polygon points="90,0 200,0 200,105 45,0" fill="#f59e0b" />
            </svg>
          </div>

          <div className="flex items-center justify-end gap-2 relative z-20 pt-1 pb-2 border-b border-slate-100">
            <span className="text-xs font-black text-[#1b1c3a] uppercase font-mono tracking-wider leading-normal">
              {card.personal?.organization || 'COMPANY NAME'}
            </span>
            <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b]" />
          </div>
        </div>

        <div className="space-y-2.5 my-auto relative z-20 px-6">
          <div>
            <h4 className="text-xs font-black text-[#1b1c3a] uppercase tracking-wider mb-1 leading-normal">
              Cardholder Guidelines & Conditions
            </h4>
            <p className="text-[9px] text-slate-600 leading-relaxed font-medium">
              This badge is the exclusive property of {card.personal?.organization || 'COMPANY NAME'}. If found, please drop in any post box or return to corporate headquarters.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[9.5px] text-slate-700 font-mono leading-normal">
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500 font-bold">Badge No:</span>
              <strong className="text-[#1b1c3a]">{card.security?.barcodeNumber || '89845653208871'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500 font-bold">Issue / Expiry:</span>
              <strong className="text-[#1b1c3a]">{card.personal?.issueDate || '01/2024'} – {card.personal?.expiryDate || '12/2027'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500 font-bold">Emergency Help:</span>
              <strong className="text-[#1b1c3a]">{card.contact?.phone || '+1 800 555 0192'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Headquarters:</span>
              <strong className="text-[#1b1c3a] truncate max-w-[170px]">{card.contact?.address || '450 Corporate Plaza, NY'}</strong>
            </div>
          </div>
        </div>

        <div className="pb-5 px-6 pt-2 border-t border-slate-100 flex items-end justify-between relative z-20">
          <div className="text-left">
            <span className="text-[8px] font-mono text-slate-400 block uppercase font-black leading-normal">Authorized Signature</span>
            <p className="font-serif italic text-base text-[#1b1c3a] font-black mt-0.5 leading-normal">
              {card.personal?.signatureText || 'Jamie Jhonson'}
            </p>
            <div className="w-28 h-[1px] bg-slate-300 mt-1" />
          </div>

          <div className="p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md">
            <QRCodeSVG value={qrValue} size={46} fgColor="#1b1c3a" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. FLUID CYAN WAVES (Image 3 Back: Anna Roe)
  // =========================================================================
  if (themeId === 'fluid-cyan-waves' || layout === 'fluid-cyan-waves') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none overflow-hidden z-10">
          <svg viewBox="0 0 400 120" className="w-full h-full object-cover" preserveAspectRatio="none">
            <path d="M0,0 L400,0 L400,60 C260,110 140,20 0,90 Z" fill="#00b4d8" />
            <path d="M0,0 L300,0 C180,60 80,20 0,80 Z" fill="#0077b6" />
          </svg>
        </div>

        <div className="relative z-20 pt-10 px-5 space-y-2">
          <h3 className="text-xs font-black text-slate-900 tracking-tight text-center leading-normal">
            Terms & Conditions
          </h3>
          <p className="text-[8.5px] text-slate-600 leading-relaxed text-center px-1 font-medium">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
          </p>

          <div className="text-center pt-1.5">
            <span className="text-xs font-black text-slate-900 font-mono tracking-wider leading-normal">
              ID : {card.personal?.idNumber || '01930381085'}
            </span>
          </div>

          <div className="text-center pt-1">
            <span className="text-[7.5px] text-slate-400 block font-mono font-bold uppercase leading-normal">Digital Signature</span>
            <div className="w-28 h-[1px] bg-slate-300 mx-auto my-0.5" />
            <span className="font-serif italic text-sm font-bold text-[#0077b6] leading-normal">
              {card.personal?.signatureText || 'Anna Roe'}
            </span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-between p-5 pt-0">
          <div className="w-32 h-20 absolute bottom-0 left-0 pointer-events-none">
            <svg viewBox="0 0 120 90" className="w-full h-full">
              <path d="M0,90 L120,90 C80,30 40,70 0,10 Z" fill="#00b4d8" />
              <path d="M0,90 L90,90 C50,40 20,60 0,20 Z" fill="#0077b6" />
            </svg>
          </div>

          <div />

          <div className="space-y-1 text-[8.5px] text-slate-700 font-mono text-right relative z-20 font-bold max-w-[200px] leading-normal">
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="truncate">{card.contact?.phone || '+098209283038'}</span>
              <Phone className="w-2.5 h-2.5 text-[#0077b6] flex-shrink-0" />
            </div>
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="truncate">{card.contact?.website || 'www.yourcompany.com'}</span>
              <Globe className="w-2.5 h-2.5 text-[#0077b6] flex-shrink-0" />
            </div>
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="truncate">{card.contact?.email || 'Name@company.com'}</span>
              <Mail className="w-2.5 h-2.5 text-[#0077b6] flex-shrink-0" />
            </div>
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="truncate">{card.contact?.address || 'North Street Avenue 90'}</span>
              <MapPin className="w-2.5 h-2.5 text-[#0077b6] flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. LIGHT REAL ESTATE (Image 4 Back: Amy Williams)
  // =========================================================================
  if (themeId === 'dark-real-estate' || layout === 'dark-real-estate') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-slate-50 text-slate-900 shadow-2xl rounded-2xl p-5 border border-slate-200"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="absolute top-6 right-4 text-blue-600 font-mono text-sm tracking-tighter">{'>>>'}</div>
          <div className="absolute bottom-20 left-4 text-blue-600 font-mono text-sm tracking-tighter">{'>>>'}</div>
        </div>

        <div className="relative z-10 text-center space-y-0.5 pt-1">
          <h2 className="text-base font-black tracking-widest text-[#071d36] uppercase font-mono truncate leading-normal">
            {card.personal?.fullName || 'AMY WILLIAMS'}
          </h2>
          <p className="text-xs font-mono font-bold text-slate-500 leading-normal">
            ID NO. {card.personal?.idNumber || '334265'}
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center my-auto">
          <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-blue-500/40">
            <QRCodeSVG value={qrValue} size={110} fgColor="#071d36" />
          </div>
        </div>

        <div className="relative z-10 space-y-2 text-center">
          <div className="space-y-1 text-xs font-mono font-semibold text-slate-700 leading-normal">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{card.contact?.phone || '(34) 234 213 123'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{card.contact?.email || 'info@companyname.com'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="text-[9.5px] font-black text-blue-700 uppercase tracking-[0.18em] block font-mono leading-normal">
              TERMS AND CONDITIONS
            </span>
            <p className="text-[8px] text-slate-500 leading-tight mt-0.5 px-2 font-medium">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. CHEVRON SIDEBAR (Image 5 Back)
  // =========================================================================
  if (themeId === 'chevron-sidebar' || layout === 'chevron-sidebar') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-between p-4 pr-3">
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-[#0066cc] tracking-tight leading-normal">
              Terms & Conditions
            </h3>
            <ul className="space-y-1 text-[8px] text-slate-700 leading-tight list-disc pl-3 font-medium">
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
              <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
            </ul>

            <div className="space-y-0.5 text-[9.5px] font-bold text-slate-800 pt-1.5 border-t border-slate-100 font-mono leading-normal">
              <div className="flex">
                <span className="w-24 text-slate-900 font-black">Issue date:</span>
                <span className="truncate">{card.personal?.issueDate || '00-00-0000'}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-900 font-black">Expiry date:</span>
                <span className="truncate">{card.personal?.expiryDate || '00-00-0000'}</span>
              </div>
            </div>
          </div>

          <div className="pt-1.5">
            <Barcode number={card.security?.barcodeNumber || "1234567890432"} height="h-7" textColor="text-slate-800" />
            <div className="w-full h-3 bg-[#004080] rounded-sm mt-1.5" />
          </div>
        </div>

        <div className="w-14 sm:w-16 bg-[#0066cc] flex flex-col items-center justify-between py-4 text-white flex-shrink-0">
          <div className="space-y-1">
            <div className="w-7 h-2 border-t-[2.5px] border-r-[2.5px] border-white transform -rotate-45" />
            <div className="w-7 h-2 border-t-[2.5px] border-r-[2.5px] border-white transform -rotate-45" />
          </div>

          <div className="transform rotate-90 whitespace-nowrap tracking-wider font-extrabold uppercase text-[10px] font-mono leading-normal">
            {card.personal?.organization || 'COMPANY NAME'}
          </div>

          <div className="w-3.5 h-1 bg-white rounded-full" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. STYLISH BLUE CURVES (Image 6 Back)
  // =========================================================================
  if (themeId === 'stylish-blue-curves' || layout === 'stylish-blue-curves') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-2xl p-0"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none overflow-hidden z-10">
          <svg viewBox="0 0 400 120" className="w-full h-full object-cover" preserveAspectRatio="none">
            <path d="M0,0 L400,0 L400,40 C280,100 120,20 0,90 Z" fill="#0284c7" />
            <path d="M0,0 L320,0 C200,60 80,10 0,80 Z" fill="#0c4a6e" />
          </svg>
        </div>

        <div className="relative z-20 flex justify-end items-center pt-3 pr-5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-[#38bdf8] flex items-center justify-center text-white">
              <Box className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-white uppercase font-mono tracking-wider leading-normal">
              {card.personal?.organization || 'COMPANY LOGO'}
            </span>
          </div>
        </div>

        <div className="relative z-20 my-auto space-y-2 pt-6 px-5">
          <div className="space-y-0.5 text-xs font-bold text-slate-800 font-mono leading-normal">
            <p>Join : {card.personal?.issueDate || 'MM/DD/YEAR'}</p>
            <p>Expire : {card.personal?.expiryDate || 'MM/DD/YEAR'}</p>
          </div>

          <ul className="space-y-1 text-[8.5px] text-slate-700 list-disc pl-3 leading-relaxed font-medium">
            <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elite, sedean diam nonummy nibh.</li>
            <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elite, sedean diam nonummy nibh.</li>
          </ul>
        </div>

        <div className="relative z-20 pb-4 px-5 flex items-end justify-between">
          <div className="w-24 h-16 absolute bottom-0 left-0 pointer-events-none">
            <svg viewBox="0 0 100 70" className="w-full h-full">
              <path d="M0,70 L100,70 C60,20 30,50 0,10 Z" fill="#38bdf8" />
            </svg>
          </div>

          <div />

          <div className="text-right">
            <span className="text-[8px] font-mono text-slate-400 block font-bold uppercase leading-normal">Your Signature</span>
            <span className="font-serif italic text-base text-[#0284c7] font-black leading-normal">
              {card.personal?.signatureText || 'Yours Sincerely'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. CLEAN NAVY & SLATE WEDGE (Image 7 Back: Austin Ortiz) — PURE VECTOR WEDGES
  // =========================================================================
  if (themeId === 'clean-geometric-wedge' || layout === 'clean-geometric-wedge') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
        style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        {/* Top Header with Pure SVG Slanted Slate Wedge */}
        <div className="relative h-14 bg-[#0b1d3a] flex items-center justify-between px-5 text-white overflow-hidden flex-shrink-0">
          <span className="text-xs font-black tracking-[0.2em] uppercase font-mono leading-normal relative z-10">
            {card.personal?.organization || 'COMPANYNAME'}
          </span>

          <svg viewBox="0 0 120 56" className="absolute top-0 right-0 w-28 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="38,0 120,0 120,56 0,56" fill="#3b6fb6" />
          </svg>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 space-y-2.5 my-auto flex-grow flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-[#0b1d3a] uppercase tracking-wider mb-1 flex items-center gap-1.5 leading-normal">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3b6fb6]" />
              <span>TERMS OF EMPLOYMENT & OFFICIAL USE</span>
            </h4>
            <ul className="space-y-1 text-[8.5px] text-slate-600 leading-tight list-disc pl-3 font-medium">
              <li>This card is non-transferable and remains the official property of {card.personal?.organization || 'the company'}.</li>
              <li>Holder must visibly wear this badge at all times while present on corporate facilities.</li>
              <li>Loss or theft must be reported immediately to Security Operations.</li>
              <li>Cardholder agrees to surrender this credential upon end of engagement or termination.</li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1 text-[9px] text-slate-700 font-mono leading-normal">
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Issue / Expiry:</span>
              <strong className="text-[#0b1d3a]">{card.personal?.issueDate || '06/08/16'} – {card.personal?.expiryDate || '06/08/26'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Emergency Phone:</span>
              <strong className="text-[#0b1d3a]">{card.contact?.phone || '946 385 921'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Official Email:</span>
              <strong className="text-[#0b1d3a] truncate max-w-[150px]">{card.contact?.email || 'Austinortiz@gmail.com'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Headquarters:</span>
              <strong className="text-[#0b1d3a] truncate max-w-[150px]">{card.contact?.address || '100 Financial Way, Tower 1'}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div className="text-left">
              <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-bold leading-normal">Authorized Signature</span>
              <p className="font-serif italic text-sm text-[#0b1d3a] font-black leading-normal">
                {card.personal?.signatureText || 'Austin Ortiz'}
              </p>
              <div className="w-24 h-[1px] bg-slate-300 mt-0.5" />
            </div>

            <div className="text-right flex flex-col items-end">
              <Barcode number={card.security?.barcodeNumber || "0000060816"} height="h-6" showDigits={true} textColor="text-[#0b1d3a]" />
            </div>
          </div>
        </div>

        {/* Bottom Symmetrical Vector Slate Wedge */}
        <div className="relative h-12 bg-[#0b1d3a] overflow-hidden flex-shrink-0">
          <svg viewBox="0 0 130 48" className="absolute top-0 left-0 w-32 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="0,0 130,0 92,48 0,48" fill="#3b6fb6" />
          </svg>
        </div>
      </div>
    );
  }

  // Default Smart Card Back
  return (
    <div
      id={id}
      className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between p-5 bg-slate-900 text-white rounded-2xl"
    >
      <div className="h-7 bg-black -mx-5 -mt-5 mb-2" />
      <div className="my-auto space-y-2">
        <p className="text-xs italic text-slate-300 leading-normal">"{card.personal?.bio || 'Authorized Member Card'}"</p>
      </div>
      <div className="flex justify-between items-end border-t border-white/10 pt-2 text-xs font-mono leading-normal">
        <Barcode number={card.security?.barcodeNumber || "123456"} height="h-6" textColor="text-slate-400" />
      </div>
    </div>
  );
}
