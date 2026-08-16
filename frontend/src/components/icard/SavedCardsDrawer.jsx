import React, { useEffect, useState } from 'react';
import { 
  FolderOpen, 
  X, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Eye, 
  QrCode, 
  Plus, 
  Calendar, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { cardApi as api } from '../../services/cardApi';
import { INITIAL_CARD_DATA } from '../../constants/icardThemes';

export default function SavedCardsDrawer({
  isOpen,
  onClose,
  onLoadCard,
  onNewCard
}) {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCards();
      setCards(data || []);
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved card?')) return;
    try {
      await api.deleteCard(id);
      setCards(prev => prev.filter(c => c._id !== id && c.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleDuplicate = async (card, e) => {
    e.stopPropagation();
    try {
      const duplicated = {
        ...card,
        _id: undefined,
        title: `${card.personal?.fullName || 'Card'} (Copy)`,
        personal: {
          ...card.personal,
          fullName: `${card.personal?.fullName || 'Copy'}`
        }
      };
      const res = await api.saveCard(duplicated);
      if (res.success) {
        fetchCards();
      }
    } catch (err) {
      alert('Duplicate failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Saved Cards Database</h3>
              <p className="text-xs text-slate-400">{cards.length} Cards in MongoDB Store</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Create Fresh Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              onNewCard();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Blank Card</span>
          </button>
        </div>

        {/* Cards List */}
        <div className="p-4 overflow-y-auto flex-grow space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs">Loading cards from database...</span>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">No saved cards yet</h4>
              <p className="text-xs text-slate-500">
                Customize your card and click "Save" in the top bar to store it in the MERN database.
              </p>
            </div>
          ) : (
            cards.map((c) => {
              const cardId = c._id || c.id;
              const dateStr = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'Recent';
              const views = c.analytics?.views || 0;
              const scans = c.analytics?.qrScans || 0;

              return (
                <div
                  key={cardId}
                  onClick={() => {
                    onLoadCard(c);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-900 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                        {c.media?.avatarUrl ? (
                          <img src={c.media.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-400">
                            {c.personal?.fullName?.charAt(0) || 'ID'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                          {c.personal?.fullName || 'Untitled Card'}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {c.personal?.jobTitle || 'No Title'} • {c.personal?.organization || 'Personal'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDuplicate(c, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(cardId, e)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" /> {views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-slate-400" /> {scans} scans
                      </span>
                    </div>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
