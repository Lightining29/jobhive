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
  PhoneCall,
  CheckCircle2,
  ScanLine
} from 'lucide-react';
import { generateVCardString } from '../../utils/vcard';

export default function CardBack({ card, theme, id = "card-back-face" }) {
  const themeId = theme?.id || card.theme?.themeId || 'corporate-diagonal';
  const layout = theme?.layoutType || card.layoutType || themeId;
  const colors = theme?.colors || {};
  const typography = theme?.typography || {};

  // Genuine Public Verification QR Target
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
  const Barcode = ({ number = "1234567890", height = "h-7", showDigits = true, textColor = "text-slate-800", customClass = "" }) => (
    <div className={`flex flex-col items-center ${customClass}`}>
      <div className={`${height} flex items-center justify-center gap-[2px] bg-white p-1 rounded`}>
        {String(number).split('').map((char, idx) => {
          const width = (char.charCodeAt(0) % 3) + 1.2;
          return <div key={idx} className="bg-black h-full" style={{ width: `${width}px` }} />;
        })}
      </div>
      {showDigits && (
        <span className={`text-[9px] font-mono tracking-widest ${textColor} mt-0.5 font-bold leading-normal`}>
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
          <span className="transform -rotate-90 whitespace-nowrap text-white font-black text-xs sm:text-sm tracking-[0.25em] uppercase font-mono leading-normal">
            IDENTITY CARD
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between p-3.5 sm:p-4">
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#071d36] tracking-tight leading-normal">
                Terms & Conditions
              </h3>
              <span className="text-[8px] font-mono font-bold text-emerald-600 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Official ID
              </span>
            </div>
            
            <ul className="space-y-0.5 text-[8px] sm:text-[8.5px] text-slate-700 leading-tight list-disc pl-3 font-medium">
              <li>This card is non-transferable and remains property of {card.personal?.organization || 'the organization'}.</li>
              <li>Must be presented upon request to security personnel.</li>
              <li>Scan the genuine QR code to verify credential authenticity.</li>
            </ul>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="space-y-0.5 text-[9px] font-bold text-slate-800 font-mono leading-normal">
                <div className="flex items-center">
                  <span className="w-16 text-slate-900 font-black">Issue date</span>
                  <span className="mr-1">:</span>
                  <span className="truncate">{card.personal?.issueDate || '01-01-2024'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-16 text-slate-900 font-black">Expiry date</span>
                  <span className="mr-1">:</span>
                  <span className="truncate">{card.personal?.validUntil || card.personal?.expiryDate || '12-2028'}</span>
                </div>
              </div>

              {/* Genuine Verification QR */}
              <div className="flex flex-col items-center bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-sm">
                <QRCodeSVG value={qrValue} size={48} level="H" fgColor="#071d36" bgColor="#ffffff" />
                <span className="text-[6.5px] font-mono font-extrabold text-[#071d36] uppercase mt-0.5">
                  Scan to Verify
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-14 -mr-3.5 -mb-3.5 sm:-mr-4 sm:-mb-4 mt-1 overflow-hidden">
            <svg viewBox="0 0 200 65" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
              <polygon points="0,25 200,0 200,65 0,65" fill="#0077b6" />
            </svg>
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white text-center pt-2">
              <p className="font-serif italic text-xs text-white font-bold leading-none">
                {card.personal?.signatureText || card.personal?.fullName || 'Authorized Signature'}
              </p>
              <div className="w-24 h-[1px] bg-white/80 mx-auto my-0.5" />
              <span className="text-[8px] font-mono tracking-widest uppercase font-bold text-white/95 block leading-none">
                {card.personal?.directorName || 'Director of Security'}
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

        <div className="space-y-2 my-auto relative z-20 px-6">
          <div>
            <h4 className="text-xs font-black text-[#1b1c3a] uppercase tracking-wider mb-0.5 leading-normal flex items-center justify-between">
              <span>Cardholder Guidelines</span>
              <span className="text-[8px] font-mono text-amber-600 font-bold">VERIFIED</span>
            </h4>
            <p className="text-[8.5px] text-slate-600 leading-relaxed font-medium">
              This badge is the exclusive property of {card.personal?.organization || 'COMPANY NAME'}. Scan QR code to verify security authenticity.
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-[9px] text-slate-700 font-mono leading-normal">
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Badge No:</span>
              <strong className="text-[#1b1c3a]">{card.personal?.idNumber || card.security?.barcodeNumber || '8984565320'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Validity:</span>
              <strong className="text-[#1b1c3a]">{card.personal?.validUntil || '12/2028'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Emergency Hotline:</span>
              <strong className="text-[#1b1c3a]">{card.contact?.phone || '+91 98765 43210'}</strong>
            </div>
          </div>
        </div>

        <div className="pb-4 px-6 pt-1.5 border-t border-slate-100 flex items-end justify-between relative z-20">
          <div className="text-left">
            <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-black leading-normal">Authorized Signature</span>
            <p className="font-serif italic text-sm text-[#1b1c3a] font-black mt-0.5 leading-normal">
              {card.personal?.signatureText || card.personal?.fullName || 'Jamie Jhonson'}
            </p>
            <div className="w-24 h-[1px] bg-slate-300 mt-0.5" />
          </div>

          {/* Genuine QR Code */}
          <div className="flex flex-col items-center p-1 rounded-2xl bg-white border border-slate-200 shadow-md">
            <QRCodeSVG value={qrValue} size={50} level="H" fgColor="#1b1c3a" bgColor="#ffffff" />
            <span className="text-[6.5px] font-mono font-extrabold text-[#1b1c3a] uppercase mt-0.5">
              Scan to Verify
            </span>
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
        <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none overflow-hidden z-10">
          <svg viewBox="0 0 400 120" className="w-full h-full object-cover" preserveAspectRatio="none">
            <path d="M0,0 L400,0 L400,60 C260,110 140,20 0,90 Z" fill="#00b4d8" />
            <path d="M0,0 L300,0 C180,60 80,20 0,80 Z" fill="#0077b6" />
          </svg>
        </div>

        <div className="relative z-20 pt-8 px-5 space-y-1.5">
          <h3 className="text-xs font-black text-slate-900 tracking-tight text-center leading-normal">
            Terms & Conditions
          </h3>
          <p className="text-[8px] text-slate-600 leading-relaxed text-center px-1 font-medium">
            This card is official proof of affiliation with {card.personal?.organization || 'JobHive'}. Scan the QR code to verify.
          </p>

          <div className="text-center">
            <span className="text-xs font-black text-slate-900 font-mono tracking-wider leading-normal">
              ID : {card.personal?.idNumber || 'JHV-01930'}
            </span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-between p-4 pt-0">
          {/* Genuine QR Code */}
          <div className="flex flex-col items-center bg-white p-1 rounded-xl border border-slate-200 shadow-md relative z-30">
            <QRCodeSVG value={qrValue} size={48} level="H" fgColor="#0077b6" bgColor="#ffffff" />
            <span className="text-[6.5px] font-mono font-extrabold text-[#0077b6] uppercase mt-0.5">
              Scan to Verify
            </span>
          </div>

          <div className="space-y-0.5 text-[8.5px] text-slate-700 font-mono text-right relative z-20 font-bold max-w-[200px] leading-normal">
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="truncate">{card.contact?.phone || '+91 98765 43210'}</span>
              <Phone className="w-2.5 h-2.5 text-[#0077b6] flex-shrink-0" />
            </div>
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="truncate">{card.contact?.website || 'https://jobhive.app'}</span>
              <Globe className="w-2.5 h-2.5 text-[#0077b6] flex-shrink-0" />
            </div>
            <div className="flex items-center justify-end gap-1.5 truncate">
              <span className="truncate">{card.contact?.email || 'alex@jobhive.app'}</span>
              <Mail className="w-2.5 h-2.5 text-[#0077b6] flex-shrink-0" />
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
        <div className="relative z-10 text-center space-y-0.5 pt-1">
          <h2 className="text-base font-black tracking-widest text-[#071d36] uppercase font-mono truncate leading-normal">
            {card.personal?.fullName || 'AMY WILLIAMS'}
          </h2>
          <p className="text-xs font-mono font-bold text-slate-500 leading-normal">
            ID NO. {card.personal?.idNumber || '334265'}
          </p>
        </div>

        {/* Big Genuine Verification QR */}
        <div className="relative z-10 flex flex-col items-center my-auto">
          <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-blue-500/40 flex flex-col items-center">
            <QRCodeSVG value={qrValue} size={90} level="H" fgColor="#071d36" bgColor="#ffffff" />
            <span className="text-[8px] font-mono font-black text-[#071d36] uppercase mt-1">
              SCAN TO VERIFY CREDENTIAL
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-1.5 text-center">
          <div className="space-y-0.5 text-xs font-mono font-semibold text-slate-700 leading-normal">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{card.contact?.phone || '+91 98765 43210'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{card.contact?.email || 'info@jobhive.app'}</span>
            </div>
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
          <div className="space-y-1">
            <h3 className="text-xs font-black text-[#0066cc] tracking-tight leading-normal">
              Terms & Conditions
            </h3>
            <ul className="space-y-0.5 text-[8px] text-slate-700 leading-tight list-disc pl-3 font-medium">
              <li>Official employee credential of {card.personal?.organization || 'JobHive'}.</li>
              <li>Scan the QR code below for instant verification.</li>
            </ul>

            <div className="space-y-0.5 text-[9px] font-bold text-slate-800 pt-1 border-t border-slate-100 font-mono leading-normal">
              <div className="flex">
                <span className="w-20 text-slate-900 font-black">Issue date:</span>
                <span className="truncate">{card.personal?.issueDate || '01-01-2024'}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-900 font-black">Valid Until:</span>
                <span className="truncate">{card.personal?.validUntil || '12-2028'}</span>
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between gap-2">
            <Barcode number={card.security?.barcodeNumber || "1234567890"} height="h-6" textColor="text-slate-800" />
            <div className="flex flex-col items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <QRCodeSVG value={qrValue} size={46} level="H" fgColor="#0066cc" bgColor="#ffffff" />
              <span className="text-[6px] font-mono font-bold text-[#0066cc]">SCAN VERIFY</span>
            </div>
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
        <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none overflow-hidden z-10">
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

        <div className="relative z-20 my-auto space-y-1.5 pt-4 px-5">
          <div className="space-y-0.5 text-xs font-bold text-slate-800 font-mono leading-normal">
            <p>ID : {card.personal?.idNumber || 'JHV-9048'}</p>
            <p>Valid : {card.personal?.validUntil || '12/2028'}</p>
          </div>

          <ul className="space-y-0.5 text-[8px] text-slate-700 list-disc pl-3 leading-relaxed font-medium">
            <li>Official tamper-evident credential.</li>
            <li>Scan QR for instant real-time cryptographic verification.</li>
          </ul>
        </div>

        <div className="relative z-20 pb-4 px-5 flex items-end justify-between">
          <div className="flex flex-col items-center bg-white p-1 rounded-xl border border-slate-200 shadow-md">
            <QRCodeSVG value={qrValue} size={48} level="H" fgColor="#0284c7" bgColor="#ffffff" />
            <span className="text-[6.5px] font-mono font-bold text-[#0284c7]">SCAN VERIFY</span>
          </div>

          <div className="text-right">
            <span className="text-[7.5px] font-mono text-slate-400 block font-bold uppercase leading-normal">Authorized Signature</span>
            <span className="font-serif italic text-sm text-[#0284c7] font-black leading-normal">
              {card.personal?.signatureText || card.personal?.fullName || 'Yours Sincerely'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. CLEAN NAVY & SLATE WEDGE (Image 7 Back)
  // =========================================================================
  if (themeId === 'clean-geometric-wedge' || layout === 'clean-geometric-wedge') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
        style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        <div className="relative h-12 bg-[#0b1d3a] flex items-center justify-between px-5 text-white overflow-hidden flex-shrink-0">
          <span className="text-xs font-black tracking-[0.2em] uppercase font-mono leading-normal relative z-10">
            {card.personal?.organization || 'COMPANYNAME'}
          </span>

          <svg viewBox="0 0 120 56" className="absolute top-0 right-0 w-28 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="38,0 120,0 120,56 0,56" fill="#3b6fb6" />
          </svg>
        </div>

        <div className="p-3.5 sm:p-4 space-y-2 my-auto flex-grow flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-[#0b1d3a] uppercase tracking-wider flex items-center gap-1.5 leading-normal">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3b6fb6]" />
                <span>OFFICIAL IDENTITY CREDENTIAL</span>
              </h4>
              <ul className="space-y-0.5 text-[8px] text-slate-600 leading-tight list-disc pl-3 font-medium">
                <li>Non-transferable official credential of {card.personal?.organization || 'JobHive'}.</li>
                <li>Scan genuine QR to verify card authenticity.</li>
              </ul>
            </div>

            {/* Genuine QR Code */}
            <div className="flex flex-col items-center bg-slate-50 p-1 rounded-xl border border-slate-200 flex-shrink-0 shadow-sm">
              <QRCodeSVG value={qrValue} size={48} level="H" fgColor="#0b1d3a" bgColor="#ffffff" />
              <span className="text-[6.5px] font-mono font-bold text-[#0b1d3a] mt-0.5">SCAN VERIFY</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5 text-[8.5px] text-slate-700 font-mono leading-normal">
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">ID / Expiry:</span>
              <strong className="text-[#0b1d3a]">{card.personal?.idNumber || 'JHV-9048'} • {card.personal?.validUntil || '12/2028'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Emergency Phone:</span>
              <strong className="text-[#0b1d3a]">{card.contact?.phone || '+91 98765 43210'}</strong>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-end justify-between">
            <div className="text-left">
              <span className="text-[7px] font-mono text-slate-400 block uppercase font-bold leading-normal">Authorized Signature</span>
              <p className="font-serif italic text-xs text-[#0b1d3a] font-black leading-normal">
                {card.personal?.signatureText || card.personal?.fullName || 'Austin Ortiz'}
              </p>
            </div>
            <Barcode number={card.security?.barcodeNumber || "0000060816"} height="h-5" showDigits={true} textColor="text-[#0b1d3a]" />
          </div>
        </div>

        <div className="relative h-9 bg-[#0b1d3a] overflow-hidden flex-shrink-0">
          <svg viewBox="0 0 130 48" className="absolute top-0 left-0 w-32 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="0,0 130,0 92,48 0,48" fill="#3b6fb6" />
          </svg>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DEFAULT SMART CARD BACK (FOR CYBERPUNK, OBSIDIAN LUXE, 20 THEMES)
  // =========================================================================
  return (
    <div
      id={id}
      className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Magnetic Stripe */}
      <div className="h-8 bg-black -mx-5 -mt-5 mb-2 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/30 to-transparent opacity-40" />
      </div>

      {/* Signature Panel */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 uppercase tracking-wider font-bold">
          <span>Authorized Cardholder Signature</span>
          <span className="text-cyan-400 font-mono">SEC-ID: {card.personal?.idNumber || 'JHV-9048-X'}</span>
        </div>
        <div className="h-8 bg-white/95 rounded-lg border border-slate-300 flex items-center justify-between px-3 text-slate-900 shadow-inner">
          <span className="font-serif italic text-sm font-bold text-slate-800 truncate">
            {card.personal?.signatureText || card.personal?.fullName || 'Alex Rivera'}
          </span>
          <span className="font-mono text-[9px] text-slate-400 tracking-widest">
            {card.security?.barcodeNumber?.slice(-4) || '9048'}
          </span>
        </div>
      </div>

      {/* Main Back Telemetry & Genuine Verification QR */}
      <div className="grid grid-cols-12 gap-3 items-center my-auto pt-1">
        {/* Left Telemetry */}
        <div className="col-span-8 space-y-1.5 text-[8.5px] text-slate-300 font-mono leading-relaxed">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[9px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>JobHive Authenticated Smart Card</span>
          </div>

          <p className="text-slate-400 text-[8px] leading-tight">
            This digital identity pass is cryptographically registered. Scan QR code to verify live credential status.
          </p>

          <div className="grid grid-cols-2 gap-1 text-[8px] pt-0.5 border-t border-slate-800 text-slate-400">
            <div>
              <span className="text-slate-500 block">Valid Until</span>
              <span className="text-slate-200 font-bold">{card.personal?.validUntil || '12/2028'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Emergency</span>
              <span className="text-slate-200 font-bold truncate block">{card.contact?.phone || '+91 98765 43210'}</span>
            </div>
          </div>
        </div>

        {/* Right Genuine QR Code */}
        <div className="col-span-4 flex flex-col items-center justify-center">
          <div className="p-1.5 rounded-2xl bg-white shadow-xl border-2 border-cyan-500/50 flex flex-col items-center group hover:scale-105 transition-transform">
            <QRCodeSVG
              value={qrValue}
              size={64}
              level="H"
              includeMargin={false}
              fgColor="#090d16"
              bgColor="#ffffff"
            />
            <span className="text-[6.5px] font-mono font-black text-slate-900 tracking-wider mt-0.5 uppercase">
              Scan Verify
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Barcode & Telemetry Strip */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8.5px] text-slate-400 uppercase font-bold">
            {card.security?.badgeLabel || 'ACTIVE CREDENTIAL'}
          </span>
        </div>

        <Barcode number={card.security?.barcodeNumber || "9840219483"} height="h-5" textColor="text-slate-400" />
      </div>
    </div>
  );
}
