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
  ScanLine,
  Award,
  Fingerprint
} from 'lucide-react';
import { generateVCardString } from '../../utils/vcard';

export default function CardBack({ card, theme, id = "card-back-face" }) {
  const themeId = theme?.id || card.theme?.themeId || 'corporate-diagonal';
  const layout = theme?.layoutType || card.layoutType || themeId;
  const colors = theme?.colors || {};
  const typography = theme?.typography || {};
  const isVertical = card.orientation === 'vertical';

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
        <span className={`text-[10px] font-mono tracking-widest ${textColor} mt-0.5 font-bold leading-normal`}>
          {number}
        </span>
      )}
    </div>
  );

  // =========================================================================
  // 1. CORPORATE BLUE DIAGONAL (Vertical & Horizontal Rich Layout)
  // =========================================================================
  if (themeId === 'corporate-diagonal' || layout === 'corporate-diagonal') {
    if (isVertical) {
      return (
        <div
          id={id}
          className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          {/* Top Header Bar */}
          <div className="relative h-14 bg-[#071d36] flex items-center justify-between px-6 text-white overflow-hidden flex-shrink-0">
            <span className="text-xs font-black tracking-[0.25em] uppercase font-mono relative z-10">
              {card.personal?.organization || 'JOBHIVE INC.'}
            </span>
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold relative z-10">
              <ShieldCheck className="w-4 h-4" />
              <span>OFFICIAL ID</span>
            </div>
            <svg viewBox="0 0 120 56" className="absolute top-0 right-0 w-32 h-full pointer-events-none" preserveAspectRatio="none">
              <polygon points="35,0 120,0 120,56 0,56" fill="#0077b6" />
            </svg>
          </div>

          {/* Core Content Area */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
            {/* Terms of Use */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                <h4 className="text-xs font-black text-[#071d36] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>Terms & Verification Guidelines</span>
                </h4>
                <span className="text-[9px] font-mono font-bold text-emerald-600">VERIFIED</span>
              </div>
              <ul className="space-y-1 text-[9.5px] text-slate-700 leading-tight list-disc pl-4 font-medium">
                <li>This card is non-transferable and remains property of {card.personal?.organization || 'JobHive'}.</li>
                <li>Holder must present this badge upon request to facility security.</li>
                <li>Scan the authentic QR code below for instant cryptographic verification.</li>
              </ul>
            </div>

            {/* BIG CENTERED QR CODE */}
            <div className="flex flex-col items-center justify-center my-auto py-1">
              <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-blue-500/40 flex flex-col items-center group hover:scale-105 transition-transform">
                <QRCodeSVG value={qrValue} size={115} level="H" fgColor="#071d36" bgColor="#ffffff" />
                <div className="mt-1.5 flex items-center gap-1 text-[8.5px] font-mono font-black text-[#071d36] tracking-wider uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>SCAN TO VERIFY ID</span>
                </div>
              </div>
            </div>

            {/* Comprehensive Info Ledger */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-[10px] text-slate-800 font-mono">
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500 font-bold">Credential ID:</span>
                <strong className="text-[#071d36] font-black">{card.personal?.idNumber || 'JHV-9048-X'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500 font-bold">Issue / Valid:</span>
                <strong className="text-[#071d36]">{card.personal?.issueDate || '01-01-2024'} – {card.personal?.validUntil || card.personal?.expiryDate || '12-2028'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1">
                <span className="text-slate-500 font-bold">Emergency Phone:</span>
                <strong className="text-[#071d36]">{card.contact?.phone || '+91 98765 43210'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Official Email:</span>
                <strong className="text-[#071d36] truncate max-w-[170px]">{card.contact?.email || 'alex@jobhive.app'}</strong>
              </div>
            </div>

            {/* Authorized Signature & Barcode */}
            <div className="pt-2 border-t border-slate-200 flex items-end justify-between">
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-400 block uppercase font-bold">Authorized Signature</span>
                <p className="font-serif italic text-sm text-[#071d36] font-black mt-0.5">
                  {card.personal?.signatureText || card.personal?.fullName || 'Alex Rivera'}
                </p>
                <div className="w-24 h-[1px] bg-slate-300 mt-0.5" />
              </div>
              <Barcode number={card.security?.barcodeNumber || "1234567890"} height="h-6" textColor="text-[#071d36]" />
            </div>
          </div>

          {/* Bottom Symmetrical Vector Wave */}
          <div className="relative h-11 bg-[#071d36] overflow-hidden flex-shrink-0">
            <svg viewBox="0 0 130 48" className="absolute top-0 left-0 w-36 h-full pointer-events-none" preserveAspectRatio="none">
              <polygon points="0,0 130,0 92,48 0,48" fill="#0077b6" />
            </svg>
          </div>
        </div>
      );
    }

    // Horizontal Layout
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

        <div className="flex-1 min-w-0 flex flex-col justify-between p-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h3 className="text-xs font-black text-[#071d36] uppercase tracking-tight">
                Terms & Conditions
              </h3>
              <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Authentic
              </span>
            </div>
            
            <p className="text-[9px] text-slate-600 leading-relaxed font-medium">
              This card is non-transferable property of {card.personal?.organization || 'JobHive'}. Scan QR code for instant live validation.
            </p>

            <div className="grid grid-cols-12 gap-3 items-center pt-1">
              <div className="col-span-7 space-y-1 text-[9.5px] font-bold text-slate-800 font-mono">
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="text-slate-500">ID Number:</span>
                  <span className="text-[#071d36]">{card.personal?.idNumber || 'JHV-9048'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="text-[#071d36]">{card.personal?.validUntil || '12-2028'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency:</span>
                  <span className="text-[#071d36] truncate">{card.contact?.phone || '+91 98765 43210'}</span>
                </div>
              </div>

              {/* Big Centered QR */}
              <div className="col-span-5 flex flex-col items-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-md flex flex-col items-center">
                  <QRCodeSVG value={qrValue} size={68} level="H" fgColor="#071d36" bgColor="#ffffff" />
                  <span className="text-[7px] font-mono font-black text-[#071d36] uppercase mt-0.5">
                    Scan to Verify
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-bold">Authorized Signature</span>
              <p className="font-serif italic text-xs text-[#071d36] font-bold">
                {card.personal?.signatureText || card.personal?.fullName || 'Alex Rivera'}
              </p>
            </div>
            <Barcode number={card.security?.barcodeNumber || "1234567890"} height="h-5" textColor="text-[#071d36]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MODERN GOLD GEOMETRIC BADGE (Jamie Jhonson)
  // =========================================================================
  if (themeId === 'modern-gold-badge' || layout === 'modern-gold-badge') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-[1.75rem] p-0"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Gold Geometric Header */}
        <div className="relative pt-4 px-6">
          <div className="w-16 h-3 rounded-full bg-slate-200/90 mx-auto border border-slate-300 shadow-inner relative z-30" />

          <div className="absolute top-0 left-0 w-48 h-40 pointer-events-none overflow-hidden z-10">
            <svg viewBox="0 0 200 180" className="w-full h-full transform scale-x-[-1]">
              <polygon points="40,0 200,0 200,180 90,180" fill="#1b1c3a" />
              <polygon points="120,0 200,0 200,60 80,0" fill="#d97706" />
              <polygon points="90,0 200,0 200,105 45,0" fill="#f59e0b" />
            </svg>
          </div>

          <div className="flex items-center justify-end gap-2 relative z-20 pt-1 pb-2 border-b border-slate-100">
            <span className="text-xs font-black text-[#1b1c3a] uppercase font-mono tracking-wider">
              {card.personal?.organization || 'COMPANY NAME'}
            </span>
            <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b]" />
          </div>
        </div>

        {/* Center Content with Rich Guidelines and BIG CENTERED QR */}
        <div className="space-y-3 my-auto relative z-20 px-6 flex-1 flex flex-col justify-between py-2">
          <div>
            <h4 className="text-xs font-black text-[#1b1c3a] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Cardholder Terms & Security</span>
              <span className="text-[8.5px] font-mono text-amber-600 font-extrabold">AUTHENTIC</span>
            </h4>
            <p className="text-[9.5px] text-slate-600 leading-relaxed font-medium">
              This credential is the exclusive property of {card.personal?.organization || 'JobHive'}. Scan the live QR below for cryptographic verification.
            </p>
          </div>

          {/* BIG CENTERED QR CODE */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-amber-500/40 flex flex-col items-center group hover:scale-105 transition-transform">
              <QRCodeSVG value={qrValue} size={isVertical ? 115 : 75} level="H" fgColor="#1b1c3a" bgColor="#ffffff" />
              <span className="text-[8.5px] font-mono font-black text-[#1b1c3a] uppercase tracking-wider mt-1">
                SCAN TO VERIFY CREDENTIAL
              </span>
            </div>
          </div>

          {/* Info Ledger */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-[9.5px] text-slate-700 font-mono">
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Badge Number:</span>
              <strong className="text-[#1b1c3a] font-black">{card.personal?.idNumber || '8984565320'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Issue / Expiry:</span>
              <strong className="text-[#1b1c3a]">{card.personal?.issueDate || '01/2024'} – {card.personal?.validUntil || '12/2028'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Emergency Hotline:</span>
              <strong className="text-[#1b1c3a]">{card.contact?.phone || '+91 98765 43210'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Headquarters:</span>
              <strong className="text-[#1b1c3a] truncate max-w-[170px]">{card.contact?.address || '450 Corporate Plaza, NY'}</strong>
            </div>
          </div>
        </div>

        {/* Footer Signature Strip */}
        <div className="pb-4 px-6 pt-2 border-t border-slate-100 flex items-end justify-between relative z-20">
          <div className="text-left">
            <span className="text-[8px] font-mono text-slate-400 block uppercase font-black">Authorized Signature</span>
            <p className="font-serif italic text-base text-[#1b1c3a] font-black mt-0.5">
              {card.personal?.signatureText || card.personal?.fullName || 'Jamie Jhonson'}
            </p>
            <div className="w-28 h-[1px] bg-slate-300 mt-1" />
          </div>

          <Barcode number={card.security?.barcodeNumber || "898456532088"} height="h-6" textColor="text-[#1b1c3a]" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. FLUID CYAN WAVES (Anna Roe)
  // =========================================================================
  if (themeId === 'fluid-cyan-waves' || layout === 'fluid-cyan-waves') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none overflow-hidden z-10">
          <svg viewBox="0 0 400 120" className="w-full h-full object-cover" preserveAspectRatio="none">
            <path d="M0,0 L400,0 L400,60 C260,110 140,20 0,90 Z" fill="#00b4d8" />
            <path d="M0,0 L300,0 C180,60 80,20 0,80 Z" fill="#0077b6" />
          </svg>
        </div>

        <div className="relative z-20 pt-8 px-6 space-y-2.5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight text-center">
              Official Cardholder Terms
            </h3>
            <p className="text-[9.5px] text-slate-600 leading-relaxed text-center px-1 font-medium mt-1">
              This card certifies membership with {card.personal?.organization || 'JobHive'}. Scan the QR code to verify credential authenticity.
            </p>
          </div>

          {/* BIG CENTERED QR CODE */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-[#0077b6]/40 flex flex-col items-center group hover:scale-105 transition-transform">
              <QRCodeSVG value={qrValue} size={isVertical ? 115 : 75} level="H" fgColor="#0077b6" bgColor="#ffffff" />
              <span className="text-[8.5px] font-mono font-black text-[#0077b6] uppercase mt-1">
                SCAN TO VERIFY
              </span>
            </div>
          </div>

          {/* Structured Telemetry */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-[9.5px] font-mono text-slate-700">
            <div className="flex justify-between border-b border-slate-200/80 pb-0.5">
              <span className="text-slate-500 font-bold">Member ID:</span>
              <strong className="text-[#0077b6] font-black">{card.personal?.idNumber || 'JHV-01930'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-0.5">
              <span className="text-slate-500 font-bold">Valid Period:</span>
              <strong className="text-slate-900">{card.personal?.issueDate || '01-01-2024'} – {card.personal?.validUntil || '12-2028'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Contact Email:</span>
              <strong className="text-slate-900 truncate max-w-[160px]">{card.contact?.email || 'alex@jobhive.app'}</strong>
            </div>
          </div>
        </div>

        <div className="relative z-20 pb-4 px-6 flex items-end justify-between border-t border-slate-100 pt-2">
          <div>
            <span className="text-[7.5px] font-mono text-slate-400 block font-bold uppercase">Digital Signature</span>
            <span className="font-serif italic text-sm font-bold text-[#0077b6]">
              {card.personal?.signatureText || card.personal?.fullName || 'Anna Roe'}
            </span>
          </div>
          <Barcode number={card.security?.barcodeNumber || "01930381085"} height="h-5" textColor="text-[#0077b6]" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. LIGHT REAL ESTATE (Amy Williams)
  // =========================================================================
  if (themeId === 'dark-real-estate' || layout === 'dark-real-estate') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-slate-50 text-slate-900 shadow-2xl rounded-3xl p-6 border border-slate-200"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="relative z-10 text-center space-y-1">
          <h2 className="text-base font-black tracking-widest text-[#071d36] uppercase font-mono truncate">
            {card.personal?.fullName || 'AMY WILLIAMS'}
          </h2>
          <p className="text-xs font-mono font-bold text-blue-600">
            ID NO. {card.personal?.idNumber || '334265'}
          </p>
        </div>

        {/* BIG CENTERED QR CODE */}
        <div className="relative z-10 flex flex-col items-center my-auto">
          <div className="p-4 rounded-3xl bg-white shadow-2xl border-2 border-blue-500/40 flex flex-col items-center group hover:scale-105 transition-transform">
            <QRCodeSVG value={qrValue} size={isVertical ? 125 : 85} level="H" fgColor="#071d36" bgColor="#ffffff" />
            <span className="text-[9px] font-mono font-black text-[#071d36] uppercase mt-1.5 tracking-wider">
              SCAN TO VERIFY CREDENTIAL
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-2">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 space-y-1 text-[10px] font-mono text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold">Organization:</span>
              <strong className="text-[#071d36]">{card.personal?.organization || 'JobHive Real Estate'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-0.5">
              <span className="text-slate-500 font-bold">Validity:</span>
              <strong className="text-[#071d36]">{card.personal?.validUntil || '12/2028'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Emergency Hotline:</span>
              <strong className="text-[#071d36]">{card.contact?.phone || '+91 98765 43210'}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-center">
            <span className="text-[9.5px] font-black text-blue-700 uppercase tracking-[0.18em] block font-mono">
              TERMS AND CONDITIONS
            </span>
            <p className="text-[8.5px] text-slate-500 leading-tight mt-0.5 px-2 font-medium">
              This card certifies authentic affiliation. Scan the QR code to verify in real-time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. CHEVRON SIDEBAR (Vertical & Horizontal)
  // =========================================================================
  if (themeId === 'chevron-sidebar' || layout === 'chevron-sidebar') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {/* Top Blue Header */}
        <div className="h-12 bg-[#0066cc] flex items-center justify-between px-6 text-white font-mono font-black text-xs uppercase">
          <span>{card.personal?.organization || 'JOBHIVE INC.'}</span>
          <span className="text-[10px] text-cyan-200">VERIFIED ID</span>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-black text-[#0066cc] uppercase tracking-wider mb-1">
              Terms & Security Guidelines
            </h4>
            <p className="text-[9.5px] text-slate-600 leading-relaxed font-medium">
              This badge is the property of {card.personal?.organization || 'JobHive'}. Scan the QR code to verify credentials.
            </p>
          </div>

          {/* BIG CENTERED QR */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-[#0066cc]/40 flex flex-col items-center">
              <QRCodeSVG value={qrValue} size={isVertical ? 115 : 75} level="H" fgColor="#0066cc" bgColor="#ffffff" />
              <span className="text-[8.5px] font-mono font-black text-[#0066cc] uppercase mt-1">
                SCAN TO VERIFY
              </span>
            </div>
          </div>

          {/* Info Details */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[9.5px] font-mono text-slate-700">
            <div className="flex justify-between border-b border-slate-200/80 pb-0.5">
              <span className="text-slate-500 font-bold">Credential ID:</span>
              <strong className="text-[#0066cc]">{card.personal?.idNumber || 'JHV-9048'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-0.5">
              <span className="text-slate-500 font-bold">Valid Period:</span>
              <strong className="text-slate-900">{card.personal?.issueDate || '01-01-2024'} – {card.personal?.validUntil || '12-2028'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Emergency Phone:</span>
              <strong className="text-slate-900">{card.contact?.phone || '+91 98765 43210'}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-bold">Authorized Signature</span>
              <p className="font-serif italic text-sm text-[#0066cc] font-bold">
                {card.personal?.signatureText || card.personal?.fullName || 'Alex Rivera'}
              </p>
            </div>
            <Barcode number={card.security?.barcodeNumber || "1234567890"} height="h-5" textColor="text-[#0066cc]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. STYLISH BLUE CURVES
  // =========================================================================
  if (themeId === 'stylish-blue-curves' || layout === 'stylish-blue-curves') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="h-12 bg-[#0c4a6e] flex items-center justify-between px-6 text-white font-mono font-black text-xs uppercase">
          <span>{card.personal?.organization || 'COMPANY LOGO'}</span>
          <span className="text-cyan-300 text-[10px]">SMART CARD</span>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-black text-[#0c4a6e] uppercase tracking-wider mb-1">
              Official Identification Terms
            </h4>
            <p className="text-[9.5px] text-slate-600 leading-relaxed font-medium">
              Official tamper-evident credential. Scan the high-resolution QR code for instant real-time verification.
            </p>
          </div>

          {/* BIG CENTERED QR */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-[#0284c7]/40 flex flex-col items-center">
              <QRCodeSVG value={qrValue} size={isVertical ? 115 : 75} level="H" fgColor="#0284c7" bgColor="#ffffff" />
              <span className="text-[8.5px] font-mono font-black text-[#0284c7] uppercase mt-1">
                SCAN TO VERIFY
              </span>
            </div>
          </div>

          {/* Info Details */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[9.5px] font-mono text-slate-700">
            <div className="flex justify-between border-b border-slate-200/80 pb-0.5">
              <span className="text-slate-500 font-bold">ID Number:</span>
              <strong className="text-[#0284c7]">{card.personal?.idNumber || 'JHV-9048'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-0.5">
              <span className="text-slate-500 font-bold">Valid Until:</span>
              <strong className="text-slate-900">{card.personal?.validUntil || '12/2028'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Emergency Phone:</span>
              <strong className="text-slate-900">{card.contact?.phone || '+91 98765 43210'}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <span className="text-[7.5px] font-mono text-slate-400 block font-bold uppercase">Authorized Signature</span>
              <span className="font-serif italic text-sm text-[#0284c7] font-black">
                {card.personal?.signatureText || card.personal?.fullName || 'Yours Sincerely'}
              </span>
            </div>
            <Barcode number={card.security?.barcodeNumber || "9840219483"} height="h-5" textColor="text-[#0284c7]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. CLEAN NAVY & SLATE WEDGE (Austin Ortiz)
  // =========================================================================
  if (themeId === 'clean-geometric-wedge' || layout === 'clean-geometric-wedge') {
    return (
      <div
        id={id}
        className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between bg-white text-slate-900 shadow-2xl rounded-3xl p-0"
        style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
      >
        <div className="relative h-14 bg-[#0b1d3a] flex items-center justify-between px-6 text-white overflow-hidden flex-shrink-0">
          <span className="text-xs font-black tracking-[0.2em] uppercase font-mono relative z-10">
            {card.personal?.organization || 'COMPANYNAME'}
          </span>
          <div className="flex items-center gap-1 text-cyan-300 font-mono text-[10px] font-bold relative z-10">
            <ShieldCheck className="w-4 h-4 text-[#3b6fb6]" />
            <span>VERIFIED ID</span>
          </div>

          <svg viewBox="0 0 120 56" className="absolute top-0 right-0 w-32 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="38,0 120,0 120,56 0,56" fill="#3b6fb6" />
          </svg>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-black text-[#0b1d3a] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3b6fb6]" />
              <span>TERMS OF EMPLOYMENT & OFFICIAL USE</span>
            </h4>
            <ul className="space-y-1 text-[9.5px] text-slate-600 leading-tight list-disc pl-4 font-medium">
              <li>This card is non-transferable and remains property of {card.personal?.organization || 'the company'}.</li>
              <li>Holder must visibly wear this badge at all times on corporate facilities.</li>
              <li>Scan genuine QR code below for instant cryptographic validation.</li>
            </ul>
          </div>

          {/* BIG CENTERED QR CODE */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-[#3b6fb6]/40 flex flex-col items-center group hover:scale-105 transition-transform">
              <QRCodeSVG value={qrValue} size={isVertical ? 115 : 75} level="H" fgColor="#0b1d3a" bgColor="#ffffff" />
              <span className="text-[8.5px] font-mono font-black text-[#0b1d3a] uppercase mt-1">
                SCAN TO VERIFY CREDENTIAL
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1 text-[10px] text-slate-700 font-mono">
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Issue / Expiry:</span>
              <strong className="text-[#0b1d3a]">{card.personal?.issueDate || '06/08/16'} – {card.personal?.validUntil || '06/08/26'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Emergency Phone:</span>
              <strong className="text-[#0b1d3a]">{card.contact?.phone || '+91 98765 43210'}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500 font-bold">Official Email:</span>
              <strong className="text-[#0b1d3a] truncate max-w-[160px]">{card.contact?.email || 'Austinortiz@gmail.com'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Headquarters:</span>
              <strong className="text-[#0b1d3a] truncate max-w-[160px]">{card.contact?.address || '100 Financial Way, Tower 1'}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <span className="text-[7.5px] font-mono text-slate-400 block uppercase font-bold">Authorized Signature</span>
              <p className="font-serif italic text-sm text-[#0b1d3a] font-black">
                {card.personal?.signatureText || card.personal?.fullName || 'Austin Ortiz'}
              </p>
              <div className="w-24 h-[1px] bg-slate-300 mt-0.5" />
            </div>

            <Barcode number={card.security?.barcodeNumber || "0000060816"} height="h-6" showDigits={true} textColor="text-[#0b1d3a]" />
          </div>
        </div>

        <div className="relative h-11 bg-[#0b1d3a] overflow-hidden flex-shrink-0">
          <svg viewBox="0 0 130 48" className="absolute top-0 left-0 w-36 h-full pointer-events-none" preserveAspectRatio="none">
            <polygon points="0,0 130,0 92,48 0,48" fill="#3b6fb6" />
          </svg>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DEFAULT MODERN SMART CARD BACK (FOR ALL 20 THEMES)
  // =========================================================================
  return (
    <div
      id={id}
      className="relative w-full h-full select-none overflow-hidden flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Magnetic Stripe */}
      <div className="h-9 bg-black -mx-6 -mt-6 mb-3 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/40 to-transparent opacity-50" />
      </div>

      {/* Signature Strip */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
          <span>Authorized Cardholder Signature</span>
          <span className="text-cyan-400 font-mono">SEC-ID: {card.personal?.idNumber || 'JHV-9048-X'}</span>
        </div>
        <div className="h-9 bg-white/95 rounded-xl border border-slate-300 flex items-center justify-between px-3.5 text-slate-900 shadow-inner">
          <span className="font-serif italic text-base font-bold text-slate-800 truncate">
            {card.personal?.signatureText || card.personal?.fullName || 'Alex Rivera'}
          </span>
          <span className="font-mono text-[10px] text-slate-400 tracking-widest font-bold">
            {card.security?.barcodeNumber?.slice(-4) || '9048'}
          </span>
        </div>
      </div>

      {/* BIG CENTERED QR CODE */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="p-3 rounded-2xl bg-white shadow-2xl border-2 border-cyan-500/50 flex flex-col items-center group hover:scale-105 transition-transform">
          <QRCodeSVG
            value={qrValue}
            size={isVertical ? 120 : 80}
            level="H"
            includeMargin={false}
            fgColor="#090d16"
            bgColor="#ffffff"
          />
          <div className="mt-1 flex items-center gap-1 text-[8.5px] font-mono font-black text-slate-900 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>SCAN TO VERIFY</span>
          </div>
        </div>
      </div>

      {/* Structured Info Table */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-[9.5px] font-mono text-slate-300">
        <div className="flex items-center justify-between text-cyan-400 font-bold uppercase text-[10px] border-b border-slate-800 pb-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>JobHive Authenticated Credential</span>
          </div>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 pt-0.5">
          <div>
            <span className="text-slate-500 block">Valid Period</span>
            <span className="text-slate-200 font-bold">{card.personal?.issueDate || '01/2024'} – {card.personal?.validUntil || '12/2028'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Emergency Phone</span>
            <span className="text-slate-200 font-bold truncate block">{card.contact?.phone || '+91 98765 43210'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Barcode & Telemetry Strip */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9.5px] text-slate-400 uppercase font-bold">
            {card.security?.badgeLabel || 'ACTIVE CREDENTIAL'}
          </span>
        </div>

        <Barcode number={card.security?.barcodeNumber || "9840219483"} height="h-5" textColor="text-slate-400" />
      </div>
    </div>
  );
}
