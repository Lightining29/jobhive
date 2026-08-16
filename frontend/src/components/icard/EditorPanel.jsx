import React, { useState } from 'react';
import { 
  Palette, 
  User, 
  Image as ImageIcon, 
  Share2, 
  Shield, 
  Sparkles, 
  Sliders, 
  Wand2, 
  Key, 
  Plus, 
  Trash2, 
  Type, 
  Layers, 
  Check, 
  RefreshCw, 
  Loader2,
  Calendar,
  FileText,
  CreditCard,
  Phone,
  Mail,
  Globe,
  MapPin
} from 'lucide-react';
import { GOOGLE_FONTS } from '../../constants/icardThemes';
import { cardApi as api, getStoredHfKey } from '../../services/cardApi';

export default function EditorPanel({
  card,
  setCard,
  theme,
  setTheme,
  themes,
  onOpenThemeGallery,
  onOpenHfKeyModal
}) {
  const [activeTab, setActiveTab] = useState('personal'); // Default to personal for quick field edits

  // AI states
  const [aiThemePrompt, setAiThemePrompt] = useState('');
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [aiBioResults, setAiBioResults] = useState(null);
  const [aiAvatarPrompt, setAiAvatarPrompt] = useState('');
  const [aiAvatarStyle, setAiAvatarStyle] = useState('cinematic');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const hasHfKey = !!getStoredHfKey();

  // Field updater helpers
  const updatePersonal = (field, val) => {
    setCard(prev => ({ 
      ...prev, 
      personal: { 
        ...(prev.personal || {}), 
        [field]: val 
      } 
    }));
  };

  const updateContact = (field, val) => {
    setCard(prev => ({ 
      ...prev, 
      contact: { 
        ...(prev.contact || {}), 
        [field]: val 
      } 
    }));
  };

  const updateMedia = (field, val) => {
    setCard(prev => ({ 
      ...prev, 
      media: { 
        ...(prev.media || {}), 
        [field]: val 
      } 
    }));
  };

  const updateSecurity = (field, val) => {
    setCard(prev => ({ 
      ...prev, 
      security: { 
        ...(prev.security || {}), 
        [field]: val 
      } 
    }));
  };

  const updateThemeColor = (colorKey, val) => {
    const updatedTheme = {
      ...theme,
      isCustom: true,
      colors: {
        ...(theme.colors || {}),
        [colorKey]: val
      }
    };
    if (colorKey === 'accent') {
      updatedTheme.colors.glowColor = val;
    }
    setTheme(updatedTheme);
    setCard(prev => ({
      ...prev,
      theme: {
        themeId: updatedTheme.id || 'custom',
        isCustom: true,
        customConfig: updatedTheme
      }
    }));
  };

  const updateThemeTypography = (key, fontName) => {
    const updatedTheme = {
      ...theme,
      isCustom: true,
      typography: {
        ...(theme.typography || {}),
        [key]: fontName
      }
    };
    setTheme(updatedTheme);
    setCard(prev => ({
      ...prev,
      theme: {
        themeId: updatedTheme.id || 'custom',
        isCustom: true,
        customConfig: updatedTheme
      }
    }));
  };

  // AI Theme Generator Handler
  const handleGenerateAITheme = async () => {
    if (!aiThemePrompt.trim()) return;
    setIsGeneratingTheme(true);
    try {
      const res = await api.generateAITheme(aiThemePrompt.trim());
      if (res.success && res.data?.theme) {
        setTheme(res.data.theme);
        setCard(prev => ({
          ...prev,
          theme: {
            themeId: res.data.theme.id,
            isCustom: true,
            customConfig: res.data.theme
          }
        }));
      }
    } catch (err) {
      console.error('AI Theme Generation failed:', err);
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  // AI Bio & Tagline Generator Handler
  const handleGenerateAIBio = async () => {
    setIsGeneratingBio(true);
    try {
      const res = await api.generateAIBio({
        name: card.personal?.fullName,
        role: card.personal?.jobTitle,
        skills: card.personal?.skills,
        organization: card.personal?.organization,
        tone: theme.name || 'Corporate Professional'
      });
      if (res.success && res.data) {
        setAiBioResults(res.data);
      }
    } catch (err) {
      console.error('AI Bio Generation failed:', err);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  // AI Avatar Generator Handler
  const handleGenerateAIAvatar = async () => {
    if (!aiAvatarPrompt.trim()) return;
    setIsGeneratingAvatar(true);
    try {
      const res = await api.generateAIAvatar(aiAvatarPrompt.trim(), aiAvatarStyle);
      if (res.success && res.data?.imageUrl) {
        updateMedia('avatarUrl', res.data.imageUrl);
      }
    } catch (err) {
      console.error('AI Avatar Generation failed:', err);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // Tab definitions
  const tabs = [
    { id: 'personal', label: 'Info & Contact', icon: User },
    { id: 'themes', label: 'Themes & Styles', icon: Palette },
    { id: 'ai', label: 'Hugging Face AI', icon: Sparkles, badge: 'AI' },
    { id: 'media', label: 'Photo & Media', icon: ImageIcon },
    { id: 'security', label: 'Security & Codes', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 shadow-2xl">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-5 overflow-y-auto flex-grow space-y-6">
        {/* ================= 1. PERSONAL & CONTACT TAB (PRIMARY) ================= */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {/* Quick Contact Info Box (Phone & Email) */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Details (Live Dynamic Update)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={card.contact?.phone || ''}
                      onChange={(e) => updateContact('phone', e.target.value)}
                      placeholder="+1 234 567 890"
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-indigo-500 focus:outline-none"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={card.contact?.email || ''}
                      onChange={(e) => updateContact('email', e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-indigo-500 focus:outline-none"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Website URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={card.contact?.website || ''}
                      onChange={(e) => updateContact('website', e.target.value)}
                      placeholder="www.yourcompany.com"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
                    />
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Office Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={card.contact?.address || ''}
                      onChange={(e) => updateContact('address', e.target.value)}
                      placeholder="North Street Avenue 90"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={card.personal?.fullName || ''}
                  onChange={(e) => updatePersonal('fullName', e.target.value)}
                  placeholder="JAMIE JHONSON"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Job Title</label>
                <input
                  type="text"
                  value={card.personal?.jobTitle || ''}
                  onChange={(e) => updatePersonal('jobTitle', e.target.value)}
                  placeholder="ASSISTANT MANAGER"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Organization & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={card.personal?.organization || ''}
                  onChange={(e) => updatePersonal('organization', e.target.value)}
                  placeholder="COMPANY NAME"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Department / Tagline</label>
                <input
                  type="text"
                  value={card.personal?.department || ''}
                  onChange={(e) => updatePersonal('department', e.target.value)}
                  placeholder="MANAGEMENT DIVISION"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Gender, DOB & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Gender</label>
                <input
                  type="text"
                  value={card.personal?.gender || ''}
                  onChange={(e) => updatePersonal('gender', e.target.value)}
                  placeholder="Male / Female"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">DOB (Birth Date)</label>
                <input
                  type="text"
                  value={card.personal?.dob || ''}
                  onChange={(e) => updatePersonal('dob', e.target.value)}
                  placeholder="01-10-21"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Blood Group</label>
                <input
                  type="text"
                  value={card.personal?.bloodGroup || ''}
                  onChange={(e) => updatePersonal('bloodGroup', e.target.value)}
                  placeholder="AB+"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* ID Number & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">ID Number</label>
                <input
                  type="text"
                  value={card.personal?.idNumber || ''}
                  onChange={(e) => updatePersonal('idNumber', e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Issue Date</label>
                <input
                  type="text"
                  value={card.personal?.issueDate || ''}
                  onChange={(e) => updatePersonal('issueDate', e.target.value)}
                  placeholder="00-00-0000"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Expiry Date</label>
                <input
                  type="text"
                  value={card.personal?.expiryDate || ''}
                  onChange={(e) => updatePersonal('expiryDate', e.target.value)}
                  placeholder="00-00-0000"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Signature & Signatory Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Signature Text</label>
                <input
                  type="text"
                  value={card.personal?.signatureText || ''}
                  onChange={(e) => updatePersonal('signatureText', e.target.value)}
                  placeholder="Sign here / Jamie Jhonson"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={card.personal?.directorName || ''}
                  onChange={(e) => updatePersonal('directorName', e.target.value)}
                  placeholder="Director / General Manager"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. THEMES & UPLOADED CARDS TAB ================= */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Exact Match From Uploaded Images (7 Styles)</span>
                </label>
                <button
                  onClick={onOpenThemeGallery}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  View All {themes.length} Themes →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themes.filter(t => t.category === 'Uploaded Exact Cards').map((t) => {
                  const isSelected = theme.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t);
                        setCard(prev => ({
                          ...prev,
                          orientation: 'vertical',
                          layoutType: t.layoutType,
                          theme: { themeId: t.id, isCustom: false, customConfig: null }
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/40'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-100">{t.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Theme Color Controls */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Color Palette Fine-Tuning</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors?.accent || '#0b2545'}
                      onChange={(e) => updateThemeColor('accent', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                    />
                    <input
                      type="text"
                      value={theme.colors?.accent || '#0b2545'}
                      onChange={(e) => updateThemeColor('accent', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Highlight Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors?.highlight || theme.colors?.accentSecondary || '#00b4d8'}
                      onChange={(e) => updateThemeColor('highlight', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                    />
                    <input
                      type="text"
                      value={theme.colors?.highlight || theme.colors?.accentSecondary || '#00b4d8'}
                      onChange={(e) => updateThemeColor('highlight', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. HUGGING FACE AI STUDIO TAB ================= */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 flex-shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>Hugging Face AI Engine</span>
                    {hasHfKey ? (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Active Key
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        Free / Fallback
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {hasHfKey ? 'Direct Inference API connected' : 'Click to add your Hugging Face API key'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenHfKeyModal}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex-shrink-0 transition-all"
              >
                {hasHfKey ? 'Manage Key' : 'Add HF Key'}
              </button>
            </div>

            {/* AI Theme Prompt Generator */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  AI Theme Prompt Generator
                </h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiThemePrompt}
                  onChange={(e) => setAiThemePrompt(e.target.value)}
                  placeholder="e.g. Modern corporate real estate agency in Zurich"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleGenerateAITheme}
                  disabled={isGeneratingTheme || !aiThemePrompt.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow flex items-center gap-1.5 flex-shrink-0 transition-all"
                >
                  {isGeneratingTheme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* AI Avatar Generator */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  AI Avatar & Portrait Generator
                </h3>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={aiAvatarPrompt}
                  onChange={(e) => setAiAvatarPrompt(e.target.value)}
                  placeholder="e.g. Professional corporate executive headshot, studio lighting"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleGenerateAIAvatar}
                  disabled={isGeneratingAvatar || !aiAvatarPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  {isGeneratingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Avatar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. PHOTO & MEDIA TAB ================= */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Avatar / Headshot URL</label>
              <input
                type="text"
                value={card.media?.avatarUrl || ''}
                onChange={(e) => updateMedia('avatarUrl', e.target.value)}
                placeholder="https://... image URL"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                Curated Avatar Presets (Matches Uploaded Cards)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80'
                ].map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateMedia('avatarUrl', url)}
                    className="w-full aspect-square rounded-xl overflow-hidden border-2 border-slate-800 hover:border-indigo-500 transition-all hover:scale-105"
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. SECURITY & BARCODES TAB ================= */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Barcode Digits (Code 128)</label>
              <input
                type="text"
                value={card.security?.barcodeNumber || ''}
                onChange={(e) => updateSecurity('barcodeNumber', e.target.value)}
                placeholder="89845653208871"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Badge Text Overlay</label>
              <input
                type="text"
                value={card.security?.badgeLabel || ''}
                onChange={(e) => updateSecurity('badgeLabel', e.target.value)}
                placeholder="OFFICIAL PASS"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
