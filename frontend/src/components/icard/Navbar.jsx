import React from 'react';
import { 
  Sparkles, 
  Palette, 
  Key, 
  Save, 
  Download, 
  Layers, 
  FolderOpen, 
  Loader2, 
  Check, 
  Share2 
} from 'lucide-react';
import { CARD_TEMPLATES } from '../constants/templates';

export default function Navbar({
  card,
  theme,
  isSaving,
  hasHfKey,
  onSaveCard,
  onOpenThemeGallery,
  onOpenHfKeyModal,
  onOpenExport,
  onOpenSavedCards,
  onSelectTemplate
}) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-sm md:text-base tracking-tight text-white flex items-center gap-2">
            <span>iCard Studio</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              20 Themes + HF AI
            </span>
          </h1>
        </div>
      </div>

      {/* Center Actions: Templates & Themes Quick Switcher */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Template Archetype Selector */}
        <select
          onChange={(e) => {
            const selected = CARD_TEMPLATES.find(t => t.id === e.target.value);
            if (selected && onSelectTemplate) onSelectTemplate(selected);
          }}
          defaultValue=""
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="" disabled>Load Archetype Template...</option>
          {CARD_TEMPLATES.map(tmpl => (
            <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
          ))}
        </select>

        {/* 20 Themes Button */}
        <button
          onClick={onOpenThemeGallery}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all hover:border-slate-700"
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>20 Themes: <strong>{theme?.name || 'Cyberpunk'}</strong></span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Hugging Face Key Button */}
        <button
          onClick={onOpenHfKeyModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            hasHfKey
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Configure Hugging Face API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{hasHfKey ? 'HF Key Active' : 'HF AI Key'}</span>
        </button>

        {/* Saved Cards Drawer Button */}
        <button
          onClick={onOpenSavedCards}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all"
          title="Saved Cards in MongoDB / Database"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Saved Cards</span>
        </button>

        {/* Save Card Button */}
        <button
          onClick={onSaveCard}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <Save className="w-3.5 h-3.5 text-indigo-400" />}
          <span>Save</span>
        </button>

        {/* Export / Print Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
