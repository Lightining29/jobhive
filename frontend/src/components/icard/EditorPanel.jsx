import React, { useState, useRef } from 'react';
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
  MapPin,
  Upload,
  Camera,
  Building2,
  PenTool,
  X,
  ImagePlus,
  Link2
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

  // Upload states
  const [uploadingField, setUploadingField] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState({});

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

  // Image Upload Handler
  const handleFileSelect = async (file, field) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, SVG)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Image size exceeds 20MB limit');
      return;
    }

    setUploadError(null);

    // Instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    updateMedia(field, localPreviewUrl);

    // Persistent server upload
    setUploadingField(field);
    try {
      const res = await api.uploadImage(file);
      if (res && res.success && res.imageUrl) {
        updateMedia(field, res.imageUrl);
      }
    } catch (err) {
      console.warn('Server upload fallback to local preview:', err);
    } finally {
      setUploadingField(null);
    }
  };

  // AI Theme Generator Handler
  const handleGenerateAITheme = async () => {
    if (!aiThemePrompt.trim()) return;
    setIsGeneratingTheme(true);
    try {
      const res = await api.generateAITheme(aiThemePrompt.trim());
      if (res.success && res.data) {
        const genTheme = {
          ...res.data,
          id: `ai_${Date.now()}`,
          isCustom: true,
        };
        setTheme(genTheme);
        setCard(prev => ({
          ...prev,
          theme: {
            themeId: genTheme.id,
            isCustom: true,
            customConfig: genTheme
          }
        }));
      }
    } catch (err) {
      console.error('AI Theme Generation failed:', err);
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  // AI Bio Generator Handler
  const handleGenerateAIBio = async () => {
    setIsGeneratingBio(true);
    try {
      const res = await api.generateAIBio({
        fullName: card.personal?.fullName,
        jobTitle: card.personal?.jobTitle,
        skills: card.personal?.skills || [],
        industry: card.personal?.organization
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

  const tabs = [
    { id: 'personal', label: 'Personal & Info', icon: User },
    { id: 'media', label: 'Photo & Media', icon: ImageIcon },
    { id: 'themes', label: 'Themes & Styles', icon: Palette },
    { id: 'ai', label: 'Hugging Face AI', icon: Sparkles, badge: 'AI' },
    { id: 'security', label: 'Security & Codes', icon: Shield },
  ];

  // Reusable Image Upload Component
  const ImageUploader = ({ label, field, icon: Icon, placeholder, aspect = 'square' }) => {
    const fileInputRef = useRef(null);
    const currentValue = card.media?.[field] || '';
    const isUploading = uploadingField === field;
    const isUrlOpen = showUrlInput[field];

    return (
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
            <span>{label}</span>
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(prev => ({ ...prev, [field]: !prev[field] }))}
            className="text-[10px] font-semibold text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <Link2 className="w-3 h-3" />
            <span>{isUrlOpen ? 'Hide URL' : 'Paste URL'}</span>
          </button>
        </div>

        {/* Upload Dropzone / Preview Area */}
        <div className="flex items-center gap-4">
          {/* Thumbnail / Upload Trigger */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all flex items-center justify-center bg-slate-900 shrink-0 ${
              currentValue
                ? 'border-indigo-500/50 hover:border-indigo-400'
                : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-850'
            } ${aspect === 'banner' ? 'w-full h-24' : 'w-20 h-20'}`}
          >
            {currentValue ? (
              <>
                <img
                  src={currentValue}
                  alt={label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                  <Upload className="w-4 h-4 text-white" />
                  <span>Change</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold leading-tight">Upload</span>
                  </>
                )}
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            )}
          </div>

          {/* Action Buttons & Status */}
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0], field);
                  e.target.value = '';
                }
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{currentValue ? 'Replace Image' : 'Choose File'}</span>
              </button>

              {currentValue && (
                <button
                  type="button"
                  onClick={() => updateMedia(field, '')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Supports JPG, PNG, WebP, SVG up to 20MB. Drag &amp; drop or click to upload.
            </p>
          </div>
        </div>

        {/* Expandable Manual URL input */}
        {isUrlOpen && (
          <div className="pt-2 border-t border-slate-800/80">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => updateMedia(field, e.target.value)}
              placeholder={placeholder || "https://... direct image URL"}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}
      </div>
    );
  };

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

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-rose-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Contents */}
      <div className="p-5 overflow-y-auto flex-grow space-y-6">
        {/* ================= 1. PERSONAL & CONTACT TAB (PRIMARY) ================= */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {/* Quick Photo Upload Box at Top of Personal Info */}
            <ImageUploader
              label="I-Card Photo / Headshot"
              field="avatarUrl"
              icon={Camera}
              placeholder="https://... photo URL"
            />

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
                      placeholder="7503962162"
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
                      placeholder="info@appletreeinfotech.in"
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
                      placeholder="www.appletreeinfotech.in"
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
                      placeholder="C-60 R.K Tower 3rd Floor Above PizzaKart RDC Rajnagar,Ghaziabad."
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
                  placeholder="Appletree Infotech"
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

            {/* ID Number & Date of Issue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date of Issue (Issue Date)</label>
                <input
                  type="text"
                  value={card.personal?.issueDate || ''}
                  onChange={(e) => updatePersonal('issueDate', e.target.value)}
                  placeholder="01-01-2024"
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

        {/* ================= 2. PHOTO & MEDIA TAB (FULL MEDIA CENTER) ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* 1. Identity Photo / Avatar Uploader */}
            <ImageUploader
              label="1. Identity Photo / Headshot"
              field="avatarUrl"
              icon={User}
              placeholder="https://... profile photo URL"
            />

            {/* 2. Company / Organization Logo Uploader */}
            <ImageUploader
              label="2. Company / Organization Logo"
              field="logoUrl"
              icon={Building2}
              placeholder="https://... logo PNG/SVG URL"
            />

            {/* 3. Official Signature Image Uploader */}
            <ImageUploader
              label="3. Official Signature (Transparent PNG)"
              field="signatureUrl"
              icon={PenTool}
              placeholder="https://... signature PNG URL"
            />

            {/* 4. Card Background / Texture Uploader */}
            <ImageUploader
              label="4. Custom Card Background Texture / Banner"
              field="coverBannerUrl"
              icon={Layers}
              placeholder="https://... background texture URL"
              aspect="banner"
            />

            {/* Curated Headshot Presets */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                Curated Avatar Presets (Click to Apply)
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
                    type="button"
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

        {/* ================= 3. THEMES & UPLOADED CARDS TAB ================= */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            {/* 7 Exact-Match Uploaded Cards Styles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Exact Match From Uploaded Images (7 Styles)</span>
                </span>
                <button 
                  onClick={onOpenThemeGallery}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {themes.filter(t => t.category === 'Uploaded Exact Cards').map((t) => {
                  const isSelected = (theme.id === t.id && !theme.isCustom) || (card.theme?.themeId === t.id);
                  const colors = t.colors || {};
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t);
                        setCard(prev => ({
                          ...prev,
                          theme: {
                            themeId: t.id,
                            isCustom: false,
                            customConfig: t
                          }
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-100 truncate">{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: colors.accent || '#3b82f6' }} />
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: colors.cardBg || '#ffffff' }} />
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: colors.bgPrimary || '#0f172a' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Themes & Smart Generative Themes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Smart Modern Styles
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {themes.filter(t => t.category !== 'Uploaded Exact Cards').map((t) => {
                  const isSelected = (theme.id === t.id && !theme.isCustom) || (card.theme?.themeId === t.id);
                  const colors = t.colors || {};
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t);
                        setCard(prev => ({
                          ...prev,
                          theme: {
                            themeId: t.id,
                            isCustom: false,
                            customConfig: t
                          }
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-100 truncate">{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: colors.accent || '#3b82f6' }} />
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: colors.cardBg || '#ffffff' }} />
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: colors.bgPrimary || '#0f172a' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Tuning */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Color Palette Tuning
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">Primary Accent</label>
                  <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={theme.colors?.accent || '#3b82f6'}
                      onChange={(e) => updateThemeColor('accent', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{theme.colors?.accent || '#3b82f6'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">Card Background</label>
                  <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={theme.colors?.cardBg || '#ffffff'}
                      onChange={(e) => updateThemeColor('cardBg', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{theme.colors?.cardBg || '#ffffff'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">Text Color</label>
                  <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={theme.colors?.textPrimary || '#0f172a'}
                      onChange={(e) => updateThemeColor('textPrimary', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{theme.colors?.textPrimary || '#0f172a'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">Background Outer</label>
                  <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={theme.colors?.bgPrimary || '#071d36'}
                      onChange={(e) => updateThemeColor('bgPrimary', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{theme.colors?.bgPrimary || '#071d36'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Tuning */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Google Fonts Typography
              </span>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Heading Font</label>
                <select
                  value={theme.typography?.headingFont || 'Montserrat'}
                  onChange={(e) => updateThemeTypography('headingFont', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {GOOGLE_FONTS.map(f => (
                    <option key={f.name} value={f.name}>{f.label} ({f.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Body Font</label>
                <select
                  value={theme.typography?.bodyFont || 'Inter'}
                  onChange={(e) => updateThemeTypography('bodyFont', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {GOOGLE_FONTS.map(f => (
                    <option key={f.name} value={f.name}>{f.label} ({f.category})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. HUGGING FACE AI TAB ================= */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {!hasHfKey && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Key className="w-4 h-4" />
                  <span>Free Hugging Face Key Recommended</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Add your free Hugging Face API key to generate unlimited custom 3D card themes, AI executive headshots, and smart bios.
                </p>
                <button
                  onClick={onOpenHfKeyModal}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-all shadow"
                >
                  Set HF API Key
                </button>
              </div>
            )}

            {/* AI Theme Prompt Generator */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Generate Theme from Text Prompt
                </h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiThemePrompt}
                  onChange={(e) => setAiThemePrompt(e.target.value)}
                  placeholder="e.g. Neon Cyberpunk Tokyo Matrix style, dark obsidian glass"
                  className="flex-grow px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  AI Avatar &amp; Portrait Generator
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
