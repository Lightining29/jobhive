import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Download, 
  Printer, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Check, 
  Loader2, 
  Copy, 
  Share2, 
  ExternalLink,
  QrCode
} from 'lucide-react';
import CardFront from './CardFront';
import CardBack from './CardBack';
import { downloadVCardFile, generateVCardString } from '../../utils/vcard';

export default function ExportModal({ isOpen, onClose, card, theme }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');

  if (!isOpen) return null;

  const cardTitle = card.personal?.fullName || 'smart_icard';
  const cleanFilename = cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const isVertical = card.orientation === 'vertical';

  // Helper to ensure all document fonts and images are ready before rasterizing
  const captureCardElement = async (element) => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Wait a brief tick for any image decoding
    await new Promise((resolve) => setTimeout(resolve, 80));

    return await html2canvas(element, {
      scale: 3.5, // 350+ DPI Print Sharpness
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure all cloned text and images have perfect rendering
        const allImgs = clonedDoc.querySelectorAll('img');
        allImgs.forEach((img) => {
          img.crossOrigin = 'anonymous';
        });

        const textElements = clonedDoc.querySelectorAll('h1, h2, h3, h4, p, span, div');
        textElements.forEach((el) => {
          el.style.overflow = 'visible';
          el.style.textRendering = 'geometricPrecision';
        });
      },
    });
  };

  // Export as High-Resolution PNG
  const handleExportPNG = async (face = 'front') => {
    setIsExporting(true);
    setExportType(`png-${face}`);
    try {
      const targetId = face === 'back' ? 'export-render-back' : 'export-render-front';
      let element = document.getElementById(targetId);
      if (!element) {
        element = document.getElementById(face === 'back' ? 'card-back-face' : 'card-front-face');
      }
      if (!element) throw new Error('Card element not found for export');

      const canvas = await captureCardElement(element);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${cleanFilename}_${face}_hd.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('PNG export failed:', err);
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  // Export as Print-Ready CR80 PDF (True ISO 7810 85.6mm x 53.98mm)
  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      let frontEl = document.getElementById('export-render-front');
      let backEl = document.getElementById('export-render-back');

      if (!frontEl) frontEl = document.getElementById('card-front-face');
      if (!backEl) backEl = document.getElementById('card-back-face');

      if (!frontEl) throw new Error('Card front element not found');

      // ISO 7810 ID-1 standard dimensions: 85.60 mm × 53.98 mm
      const cardWidthMm = isVertical ? 53.98 : 85.60;
      const cardHeightMm = isVertical ? 85.60 : 53.98;

      // Capture Front face
      const canvasFront = await captureCardElement(frontEl);
      const imgFront = canvasFront.toDataURL('image/jpeg', 0.98);

      const pdf = new jsPDF({
        orientation: isVertical ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [cardWidthMm, cardHeightMm],
      });

      pdf.addImage(imgFront, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');

      // Capture Back face
      if (backEl) {
        const canvasBack = await captureCardElement(backEl);
        const imgBack = canvasBack.toDataURL('image/jpeg', 0.98);

        pdf.addPage([cardWidthMm, cardHeightMm], isVertical ? 'portrait' : 'landscape');
        pdf.addImage(imgBack, 'JPEG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');
      }

      pdf.save(`${cleanFilename}_cr80_standard_print.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF generation failed: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Off-screen Pristine 1:1 Clean Stage for PDF/PNG Generation */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '-99999px', 
          top: 0, 
          zIndex: -99999,
          pointerEvents: 'none',
          opacity: 1
        }}
      >
        <div 
          id="export-render-front"
          style={{
            width: isVertical ? '350px' : '540px',
            height: isVertical ? '555px' : '341px',
            overflow: 'hidden'
          }}
        >
          <CardFront card={card} theme={theme} id="export-card-front-face" />
        </div>

        <div 
          id="export-render-back"
          style={{
            width: isVertical ? '350px' : '540px',
            height: isVertical ? '555px' : '341px',
            overflow: 'hidden'
          }}
        >
          <CardBack card={card} theme={theme} id="export-card-back-face" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Export & Sharing Suite</h3>
              <p className="text-xs text-slate-400">Download distortion-free print PDF (CR80 standard), HD PNGs, or vCard contact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          {/* HD PNG Front */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">High-Res PNG (Front)</h4>
                <p className="text-xs text-slate-400">Ultra-sharp 350+ DPI image with exact photo proportions</p>
              </div>
            </div>
            <button
              onClick={() => handleExportPNG('front')}
              disabled={isExporting}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              {exportType === 'png-front' ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Download className="w-4 h-4 text-cyan-400" />}
              <span>Download Front PNG</span>
            </button>
          </div>

          {/* HD PNG Back */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">High-Res PNG (Back)</h4>
                <p className="text-xs text-slate-400">Includes big centered QR code, terms & signature</p>
              </div>
            </div>
            <button
              onClick={() => handleExportPNG('back')}
              disabled={isExporting}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              {exportType === 'png-back' ? <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> : <Download className="w-4 h-4 text-pink-400" />}
              <span>Download Back PNG</span>
            </button>
          </div>

          {/* Print-Ready PDF */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">CR80 PVC Print PDF</h4>
                <p className="text-xs text-slate-400">Exact ISO 7810 ID-1 card dimensions (100% same size as screen)</p>
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {exportType === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              <span>Export Proportional PDF</span>
            </button>
          </div>

          {/* vCard Download */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Smart vCard (.vcf)</h4>
                <p className="text-xs text-slate-400">Universal contact file for iPhone, Android & Outlook</p>
              </div>
            </div>
            <button
              onClick={() => downloadVCardFile(card)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-violet-400" />
              <span>Download .vcf Contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
