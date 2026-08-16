import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, ExternalLink, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getStoredHfKey, setStoredHfKey, cardApi as api } from '../../services/cardApi';

export default function HfKeyModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null); // { success: boolean, message: string }

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredHfKey());
      setVerifyStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredHfKey(apiKey);
    if (onKeyUpdated) onKeyUpdated(apiKey);
    onClose();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setVerifyStatus({ success: false, message: 'Please enter a token first' });
      return;
    }
    setIsVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await api.verifyHfKey(apiKey.trim());
      setVerifyStatus({
        success: res.valid,
        message: res.message || (res.valid ? 'Token is verified and ready!' : 'Token verification failed')
      });
      if (res.valid) {
        setStoredHfKey(apiKey.trim());
        if (onKeyUpdated) onKeyUpdated(apiKey.trim());
      }
    } catch (err) {
      setVerifyStatus({ success: false, message: `Verification failed: ${err.message}` });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setStoredHfKey('');
    setVerifyStatus(null);
    if (onKeyUpdated) onKeyUpdated('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Hugging Face API Key</h3>
              <p className="text-xs text-slate-400">Unlock AI Theme, Bio & Avatar generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              User Access Token (Read / Write)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setVerifyStatus(null);
              }}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono transition-all"
            />
          </div>

          {/* Verification feedback */}
          {verifyStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                verifyStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {verifyStatus.success ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <span>{verifyStatus.message}</span>
            </div>
          )}

          {/* Helper details */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <p className="leading-relaxed">
              Your token is stored locally in your browser and used to call Hugging Face Inference models (FLUX.1, LLaMA-3.2, SDXL) for themes and portraits.
            </p>
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium underline"
            >
              <span>Get free Hugging Face API token</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-2">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              Clear Key
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestKey}
              disabled={isVerifying || !apiKey.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              {isVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Test Key</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              Save Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
