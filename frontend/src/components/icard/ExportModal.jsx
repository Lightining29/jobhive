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
import { QRCodeSVG } from 'qrcode.react';
import { downloadVCardFile, generateVCardString } from '../../utils/vcard';

export default function ExportModal({ isOpen, onClose, card, theme }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const cardTitle = card.personal?.fullName || 'smart_icard';
  const cleanFilename = cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Helper to ensure all document fonts are ready before rasterizing
  const captureCardElement = async (element) => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    return await html2canvas(element, {
      scale: 3, // 300+ DPI Crystal Sharp
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure all cloned text elements have overflow visible and clear line-height
        const textElements = clonedDoc.querySelectorAll('h1, h2, h3, h4, p, span, div');
        textElements.forEach(el => {
          el.style.overflow = 'visible';
          el.style.textRendering = 'geometricPrecision';
        });
      }
    });
  };

  // Export as High-Resolution PNG
  const handleExportPNG = async (face = 'front') => {
    setIsExporting(true);
    setExportType(`png-${face}`);
    try {
      const targetId = face === 'back' ? 'card-back-face' : 'card-front-face';
      const element = document.getElementById(targetId);
      if (!element) throw new Error('Card element not found');

      const canvas = await captureCardElement(element);
      const dataUrl = canvas.toDataURL('image/png');
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

  // Export as Print-Ready CR80 PDF (True Proportional Aspect Ratio)
  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      const frontEl = document.getElementById('card-front-face');
      const backEl = document.getElementById('card-back-face');
      if (!frontEl) throw new Error('Card element not found');

      const isVertical = card.orientation === 'vertical';

      // Capture Front with font-ready high-precision canvas
      const canvasFront = await captureCardElement(frontEl);

      const frontRatio = canvasFront.width / canvasFront.height;
      const baseWidthMm = isVertical ? 54 : 85.6;
      const baseHeightMm = baseWidthMm / frontRatio;

      const pdf = new jsPDF({
        orientation: isVertical ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [baseWidthMm, baseHeightMm]
      });

      const imgFront = canvasFront.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgFront, 'JPEG', 0, 0, baseWidthMm, baseHeightMm);

      // Capture Back if available
      if (backEl) {
        const canvasBack = await captureCardElement(backEl);

        const backRatio = canvasBack.width / canvasBack.height;
        const backWidthMm = isVertical ? 54 : 85.6;
        const backHeightMm = backWidthMm / backRatio;

        pdf.addPage([backWidthMm, backHeightMm], isVertical ? 'portrait' : 'landscape');
        const imgBack = canvasBack.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgBack, 'JPEG', 0, 0, backWidthMm, backHeightMm);
      }

      pdf.save(`${cleanFilename}_cr80_print.pdf`);
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
                <p className="text-xs text-slate-400">Ultra-sharp 300+ DPI image with perfect photo aspect ratio</p>
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
                <p className="text-xs text-slate-400">Includes detailed terms, signature, dates & barcode</p>
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
                <p className="text-xs text-slate-400">Standard ISO 7810 ID-1 card dimensions (Proportional — No Distortion)</p>
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
