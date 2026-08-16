import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building,
  Calendar,
  HeartPulse,
  Share2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  QrCode,
  Lock,
  Wifi,
  ChevronRight
} from 'lucide-react';
import CardCanvas from '../../components/icard/CardCanvas';
import { DEFAULT_THEMES, INITIAL_CARD_DATA } from '../../constants/icardThemes';
import { cardApi } from '../../services/cardApi';
import { downloadVCardFile } from '../../utils/vcard';
import toast from 'react-hot-toast';

export default function VerifyCardPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [verifiedData, setVerifiedData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEMES[0]);

  useEffect(() => {
    fetchVerifiedCard();
  }, [id]);

  const fetchVerifiedCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cardApi.getPublicVerifiedCard(id);
      if (res.success && res.card) {
        setVerifiedData(res);
        const cardThemeId = res.card.theme?.themeId;
        const matched = DEFAULT_THEMES.find((t) => t.id === cardThemeId) || res.card.theme?.customConfig || DEFAULT_THEMES[0];
        setActiveTheme(matched);

        // Celebratory confetti on verified scan
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.3 },
          colors: ['#00f0ff', '#10b981', '#6366f1', '#f59e0b'],
        });
      } else {
        setError(res.message || 'Identity Card record not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify identity card');
    } finally {
      setLoading(false);
    }
  };

  const card = verifiedData?.card;
  const verification = verifiedData?.verificationDetails;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${card?.personal?.fullName} — Verified Identity Card`,
        text: `Official verified identity card for ${card?.personal?.fullName} (${card?.personal?.jobTitle} at ${card?.personal?.organization})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Verification URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400 absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Verifying Smart Identity...</h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to JobHive Official Security Registry</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl flex flex-col items-center gap-4 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-rose-400">Identity Verification Failed</h3>
            <p className="text-sm text-slate-400 mt-2">{error || 'This identity card could not be validated.'}</p>
          </div>
          <Link
            to="/"
            className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Go to JobHive Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-10 px-4 sm:px-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Verification Status Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Official Verified Smart Identity
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  {verification?.authSignature}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
                {card.personal?.fullName}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Issued by <span className="text-slate-200 font-semibold">{verification?.issuedBy}</span> • Cryptographically Authenticated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => downloadVCardFile(card)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Save Contact (.vcf)</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-lg"
              title="Share Verified Card"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Grid: Full-Size 3D Interactive Stage + Verification Telemetry */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Full-Size 3D Interactive Card */}
          <div className="xl:col-span-7 flex flex-col items-center">
            <div className="w-full rounded-3xl bg-slate-950/90 border border-slate-800/90 p-4 sm:p-8 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md min-h-[620px]">
              <CardCanvas
                card={card}
                theme={activeTheme}
                onOpenExport={() => downloadVCardFile(card)}
                onOpenShare={handleShare}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              💡 Tap or hover to rotate in 3D, flip to back face, or tap the contactless NFC chip.
            </p>
          </div>

          {/* Right: Detailed Verified Information Card */}
          <div className="xl:col-span-5 space-y-6">
            {/* Identity Details Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" /> Employment & Credentials
                </h3>
                <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  {card.personal?.idNumber || 'JHV-AUTH'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Designation / Role</span>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">{card.personal?.jobTitle || 'Executive'}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Organization / Company</span>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">{card.personal?.organization || 'JobHive'}</p>
                </div>

                {card.personal?.department && (
                  <div>
                    <span className="text-slate-400 font-medium">Department / Division</span>
                    <p className="text-slate-200 mt-0.5">{card.personal?.department}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Valid Until</span>
                    <span className="text-slate-200 font-mono font-semibold">{card.personal?.validUntil || 'Active'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Blood Group</span>
                    <span className="text-rose-400 font-mono font-semibold">{card.personal?.bloodGroup || 'N/A'}</span>
                  </div>
                </div>

                {card.personal?.bio && (
                  <div className="pt-2">
                    <span className="text-slate-400 font-medium">Bio</span>
                    <p className="text-slate-300 italic mt-1 leading-relaxed">{card.personal.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Connect & Contact Links */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white mb-3">Direct Contact Channels</h3>

              {card.contact?.phone && (
                <a
                  href={`tel:${card.contact.phone}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" /> {card.contact.phone}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
              )}

              {card.contact?.email && (
                <a
                  href={`mailto:${card.contact.email}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" /> {card.contact.email}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
              )}

              {card.contact?.website && (
                <a
                  href={card.contact.website.startsWith('http') ? card.contact.website : `https://${card.contact.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" /> {card.contact.website}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </a>
              )}

              {card.contact?.location && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{card.contact.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
