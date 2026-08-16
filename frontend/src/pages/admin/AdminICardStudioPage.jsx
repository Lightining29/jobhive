import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Palette,
  Sparkles,
  Save,
  Download,
  FolderOpen,
  Plus,
  Key,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  QrCode,
  Eye,
  Edit,
  Share2,
  Search,
  RefreshCw,
  Layers,
  FileText,
  UserCheck,
  X,
  Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import CardCanvas from '../../components/icard/CardCanvas';
import EditorPanel from '../../components/icard/EditorPanel';
import ThemeGalleryModal from '../../components/icard/ThemeGalleryModal';
import ExportModal from '../../components/icard/ExportModal';
import HfKeyModal from '../../components/icard/HfKeyModal';
import SavedCardsDrawer from '../../components/icard/SavedCardsDrawer';
import { DEFAULT_THEMES, INITIAL_CARD_DATA } from '../../constants/icardThemes';
import { CARD_TEMPLATES } from '../../constants/icardTemplates';
import { cardApi, getStoredHfKey } from '../../services/cardApi';
import { downloadVCardFile } from '../../utils/vcard';

export default function AdminICardStudioPage() {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'directory'
  const [card, setCard] = useState(INITIAL_CARD_DATA);
  const [theme, setTheme] = useState(DEFAULT_THEMES[0]);
  const [themes, setThemes] = useState(DEFAULT_THEMES);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');

  // Modals
  const [isThemeGalleryOpen, setIsThemeGalleryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHfKeyOpen, setIsHfKeyOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isFullQrModalOpen, setIsFullQrModalOpen] = useState(false);
  const [fullQrCard, setFullQrCard] = useState(null);

  // Fetch cards on mount
  useEffect(() => {
    fetchDirectoryCards();
  }, []);

  const fetchDirectoryCards = async () => {
    setIsLoadingCards(true);
    try {
      const cards = await cardApi.getCards();
      setSavedCards(cards || []);
    } catch (err) {
      console.warn('Could not load cards:', err);
    } finally {
      setIsLoadingCards(false);
    }
  };

  // Open Full Size QR Modal for any card
  const handleOpenFullQr = (targetCard) => {
    setFullQrCard(targetCard || card);
    setIsFullQrModalOpen(true);
  };

  // Switch Archetype Template
  const handleSelectTemplate = (templateKey) => {
    const tmpl = CARD_TEMPLATES[templateKey];
    if (!tmpl) return;

    setCard((prev) => ({
      ...prev,
      title: tmpl.name,
      cardType: tmpl.cardType || prev.cardType,
      orientation: tmpl.orientation || prev.orientation,
      personal: { ...prev.personal, ...tmpl.personal },
      media: { ...prev.media, ...tmpl.media },
      contact: { ...prev.contact, ...tmpl.contact },
      socials: { ...prev.socials, ...tmpl.socials },
      security: { ...prev.security, ...tmpl.security },
      theme: { ...prev.theme, themeId: tmpl.themeId },
    }));

    const matchedTheme = themes.find((t) => t.id === tmpl.themeId) || themes[0];
    setTheme(matchedTheme);
    toast.success(`Loaded "${tmpl.name}" archetype!`);
  };

  // Save Card to Database
  const handleSaveCard = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...card,
        theme: {
          themeId: theme.id,
          isCustom: Boolean(theme.isCustom),
          customConfig: theme,
        },
      };

      const res = await cardApi.saveCard(payload);
      if (res.success && res.card) {
        setCard(res.card);
        toast.success(`iCard saved successfully! (ID: ${res.card.personal?.idNumber || res.card._id})`);
        fetchDirectoryCards();
      } else {
        toast.error(res.error || 'Failed to save iCard');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving iCard');
    } finally {
      setIsSaving(false);
    }
  };

  // Load an existing card
  const handleLoadCard = (loadedCard) => {
    setCard(loadedCard);
    const matched = themes.find((t) => t.id === loadedCard.theme?.themeId) || themes[0];
    setTheme(matched);
    setActiveTab('studio');
    toast.success(`Loaded "${loadedCard.personal?.fullName}"`);
  };

  // New blank card
  const handleNewCard = () => {
    const idSuffix = Math.floor(1000 + Math.random() * 9000);
    setCard({
      ...INITIAL_CARD_DATA,
      personal: {
        ...INITIAL_CARD_DATA.personal,
        fullName: 'New Member',
        idNumber: `JHV-${idSuffix}-X`,
      },
    });
    setTheme(DEFAULT_THEMES[0]);
    setActiveTab('studio');
    toast.success('Created new blank identity card');
  };

  // Delete Card
  const handleDeleteCard = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this identity card?')) return;

    try {
      const res = await cardApi.deleteCard(id);
      if (res.success) {
        toast.success('Card deleted successfully');
        fetchDirectoryCards();
        if (card._id === id) {
          handleNewCard();
        }
      }
    } catch (err) {
      toast.error('Failed to delete card');
    }
  };

  const filteredDirectory = savedCards.filter((c) => {
    const q = directorySearch.toLowerCase();
    const name = (c.personal?.fullName || '').toLowerCase();
    const role = (c.personal?.jobTitle || '').toLowerCase();
    const org = (c.personal?.organization || '').toLowerCase();
    const idNum = (c.personal?.idNumber || '').toLowerCase();
    return name.includes(q) || role.includes(q) || org.includes(q) || idNum.includes(q);
  });

  return (
    <DashboardLayout
      title="Identity Card (iCard) Studio & QR Engine"
      subtitle="Design, issue, print and verify tamper-proof digital smart cards powered by 20 Themes & Hugging Face AI"
      navItems={adminNavItems}
    >
      <div className="space-y-6 w-full max-w-full">
        {/* Top Control Bar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl">
          {/* Left: View Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'studio'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>3D Live Studio</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('directory');
                fetchDirectoryCards();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Card Directory ({savedCards.length})</span>
            </button>
          </div>

          {/* Center: Archetypes Picker */}
          {activeTab === 'studio' && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Archetype:
              </span>
              {Object.entries(CARD_TEMPLATES).map(([key, tmpl]) => (
                <button
                  key={key}
                  onClick={() => handleSelectTemplate(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white whitespace-nowrap transition-all"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenFullQr(card)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all shadow-lg shadow-cyan-500/10"
              title="View Full Size QR Verification Page"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Full Size QR</span>
            </button>

            <button
              onClick={() => setIsThemeGalleryOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              title="Browse 20 Professional Themes"
            >
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>20 Themes</span>
            </button>

            <button
              onClick={() => setIsHfKeyOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              title="Hugging Face AI Token Setup"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">HF AI Key</span>
            </button>

            <button
              onClick={handleNewCard}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">New Card</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF / PNG</span>
            </button>

            <button
              onClick={handleSaveCard}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Card'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 3D STUDIO */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left: 3D Canvas Stage */}
            <div className="xl:col-span-8 flex flex-col gap-4">
              <div className="rounded-3xl bg-slate-950 border border-slate-800 p-4 sm:p-8 min-h-[640px] flex flex-col justify-center items-center relative overflow-hidden shadow-2xl">
                <CardCanvas
                  card={card}
                  theme={theme}
                  initialScale="ultra"
                  onOpenExport={() => setIsExportOpen(true)}
                  onOpenShare={() => {
                    const verifyUrl = `${window.location.origin}/verify-card/${card._id || card.personal?.idNumber}`;
                    navigator.clipboard.writeText(verifyUrl);
                    toast.success('Live QR Verification URL copied to clipboard!');
                  }}
                />
              </div>

              {/* Quick Info Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Security Grade</h4>
                    <p className="text-sm font-bold text-white uppercase">{card.security?.badgeLabel || 'Verified ID'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Active Theme</h4>
                    <p className="text-sm font-bold text-white">{theme.name || 'Custom Theme'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">QR Scan Destination</h4>
                    <p className="text-xs font-bold text-emerald-400 truncate">
                      {card.qrSettings?.targetType === 'vcard' ? 'Save vCard Contact' : 'Public Verification'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Studio Customization Panel */}
            <div className="xl:col-span-4">
              <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl max-h-[850px] flex flex-col">
                <EditorPanel
                  card={card}
                  setCard={setCard}
                  theme={theme}
                  setTheme={setTheme}
                  themes={themes}
                  onOpenThemeGallery={() => setIsThemeGalleryOpen(true)}
                  onOpenHfKeyModal={() => setIsHfKeyOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECTORY & VERIFICATION LEDGER */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, role or company..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchDirectoryCards}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleNewCard}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate New iCard</span>
                </button>
              </div>
            </div>

            {/* Cards Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Cardholder</th>
                      <th className="px-6 py-4">Organization & ID</th>
                      <th className="px-6 py-4">Theme & Type</th>
                      <th className="px-6 py-4">Status & Scans</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredDirectory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                          {isLoadingCards ? (
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                              <span>Loading Identity Cards...</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                              <p>No identity cards found.</p>
                              <button
                                onClick={handleNewCard}
                                className="text-cyan-400 text-xs hover:underline font-bold"
                              >
                                Create your first smart identity card
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredDirectory.map((c) => (
                        <tr
                          key={c._id}
                          onClick={() => handleLoadCard(c)}
                          className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  c.media?.avatarUrl ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                    c.personal?.fullName || 'Alex'
                                  )}`
                                }
                                alt={c.personal?.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800"
                              />
                              <div>
                                <h4 className="font-bold text-white">{c.personal?.fullName || 'Unnamed'}</h4>
                                <p className="text-xs text-slate-400">{c.personal?.jobTitle || 'No Title'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-200">{c.personal?.organization || 'JobHive'}</p>
                            <p className="text-xs font-mono text-cyan-400">{c.personal?.idNumber || 'NO-ID'}</p>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              <Palette className="w-3 h-3" />
                              {c.theme?.themeId || 'cyberpunk'}
                            </span>
                            <span className="ml-2 text-xs text-slate-400 capitalize">{c.cardType || 'business'}</span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                              <span className="text-xs text-slate-400">
                                {c.analytics?.qrScans || 0} QR Scans
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleLoadCard(c)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all"
                                title="Edit in 3D Studio"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <a
                                href={`/verify-card/${c._id || c.personal?.idNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-all"
                                title="Open Live Public QR Verification Page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>

                              <button
                                onClick={() => downloadVCardFile(c)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-400 transition-all"
                                title="Download vCard (.vcf)"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => handleDeleteCard(c._id, e)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all"
                                title="Delete Card"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <ThemeGalleryModal
        isOpen={isThemeGalleryOpen}
        onClose={() => setIsThemeGalleryOpen(false)}
        themes={themes}
        selectedThemeId={theme.id}
        onSelectTheme={(t) => {
          setTheme(t);
          setCard((prev) => ({
            ...prev,
            theme: { ...prev.theme, themeId: t.id, isCustom: Boolean(t.isCustom) },
          }));
        }}
        onOpenCustomizer={() => {
          setIsThemeGalleryOpen(false);
          setActiveTab('studio');
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        card={card}
        theme={theme}
      />

      <HfKeyModal
        isOpen={isHfKeyOpen}
        onClose={() => setIsHfKeyOpen(false)}
        onKeyUpdated={(k) => {
          toast.success('Hugging Face AI key updated!');
        }}
      />

      <SavedCardsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        onLoadCard={handleLoadCard}
        onNewCard={handleNewCard}
      />

      {/* FULL SIZE QR CODE & CERTIFICATE PREVIEW MODAL */}
      {isFullQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Full-Size Live Verification QR</h3>
                  <p className="text-xs text-slate-400">
                    Scan with any mobile phone camera or open the live authenticated verification certificate
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFullQrModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-6 overflow-y-auto">
              {/* Massive Crisp QR Container */}
              <div className="p-6 rounded-3xl bg-white shadow-2xl border-4 border-cyan-500/40 relative flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
                <QRCodeSVG
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/verify-card/${fullQrCard?._id || fullQrCard?.personal?.idNumber || 'preview'}`
                      : 'https://jobhive.app'
                  }
                  size={260}
                  level="H"
                  includeMargin={false}
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                />
                <div className="mt-3 text-center">
                  <span className="text-[11px] font-mono font-bold text-slate-700 tracking-wider block">
                    ID: {fullQrCard?.personal?.idNumber || 'JHV-9048-X'}
                  </span>
                </div>
              </div>

              {/* Cardholder Details Strip */}
              <div className="w-full text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Authentic JobHive Identity Card
                </div>
                <h2 className="text-xl font-bold text-white pt-1">
                  {fullQrCard?.personal?.fullName || 'Alex Rivera'}
                </h2>
                <p className="text-xs text-slate-400">
                  {fullQrCard?.personal?.jobTitle || 'Lead AI Engineer'} •{' '}
                  <span className="text-slate-300 font-semibold">
                    {fullQrCard?.personal?.organization || 'JobHive'}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={`/verify-card/${fullQrCard?._id || fullQrCard?.personal?.idNumber || 'preview'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Full Verification Page</span>
                </a>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/verify-card/${fullQrCard?._id || fullQrCard?.personal?.idNumber || 'preview'}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Live QR Verification URL copied to clipboard!');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Copy Scan Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
