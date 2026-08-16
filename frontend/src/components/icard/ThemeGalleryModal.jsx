import React, { useState } from 'react';
import { Palette, X, Check, Sparkles, Sliders, CreditCard } from 'lucide-react';
import { THEME_CATEGORIES } from '../../constants/icardThemes';

export default function ThemeGalleryModal({ isOpen, onClose, themes, selectedThemeId, onSelectTheme, onOpenCustomizer }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredThemes = (themes || []).filter(t => {
    const matchesCat = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">iCard Themes & Exact Image Templates</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                  {themes.length} Styles
                </span>
              </div>
              <p className="text-xs text-slate-400">Includes 7 exact-match templates from your uploaded images + 14 smart 3D themes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenCustomizer) onOpenCustomizer();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Theme Customizer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {THEME_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Theme Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThemes.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            const colors = theme.colors || {};

            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme);
                  onClose();
                }}
                className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between overflow-hidden hover:scale-[1.02] ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-800/90'
                    : 'border-slate-800/90 hover:border-slate-700 bg-slate-950/70 hover:bg-slate-900'
                }`}
              >
                {/* Theme Visual Preview Pill */}
                <div
                  className="w-full h-24 rounded-xl p-3 mb-3 relative overflow-hidden flex flex-col justify-between border"
                  style={{
                    background: colors.cardBg || colors.bgPrimary || '#0f172a',
                    borderColor: colors.border || 'rgba(255,255,255,0.15)',
                    boxShadow: `0 10px 20px -5px ${colors.glowColor || '#000'}30`
                  }}
                >
                  {/* Category Pill */}
                  <div className="flex items-center justify-between z-10">
                    <span 
                      className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: colors.badgeBg || 'rgba(0,0,0,0.4)',
                        color: colors.badgeText || colors.accent || '#fff'
                      }}
                    >
                      {theme.category}
                    </span>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colors.accent }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colors.accentSecondary || colors.glowColor }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: colors.bgPrimary }} />
                    </div>
                  </div>

                  <div className="z-10 flex items-center justify-between">
                    <div>
                      <h4 
                        className={`text-xs font-bold truncate ${theme.category === 'Uploaded Exact Cards' && colors.cardBg === '#ffffff' ? 'text-slate-900' : 'text-white'}`}
                        style={{ fontFamily: theme.typography?.titleFont ? `'${theme.typography.titleFont}', sans-serif` : 'sans-serif' }}
                      >
                        {theme.name}
                      </h4>
                      <p className={`text-[9px] font-mono ${theme.category === 'Uploaded Exact Cards' && colors.cardBg === '#ffffff' ? 'text-slate-600' : 'text-slate-300'}`}>
                        Front & Back Dual Layout
                      </p>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-indigo-600 text-white shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {theme.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
