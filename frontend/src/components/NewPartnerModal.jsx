import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function NewPartnerModal({ isOpen, onClose, onPartnerAnalyzed }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAnalyzing(true);
    setError(null);
    try {
      const result = await api.analyzeCompany(name, domain, industry);
      setName('');
      setDomain('');
      setIndustry('');
      if (onPartnerAnalyzed) {
        onPartnerAnalyzed(result.company_id);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#161617] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#2997ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#f5f5f7] tracking-tight">
                Evaluate Partner
              </h3>
              <p className="text-xs text-[#86868b]">
                Run automated due diligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] text-[#86868b] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">
              Company Name <span className="text-[#ff453a]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cloudflare, Twilio, MongoDB"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-white/[0.08] text-sm text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">
              Website Domain (Optional)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. cloudflare.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-white/[0.08] text-sm text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5">
              Category / Domain (Optional)
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Cloud Security, FinTech, Data Storage"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-white/[0.08] text-sm text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff]"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/20 text-[#ff453a] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={analyzing || !name.trim()}
              className="w-full py-3 px-5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Harvesting Intelligence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Due Diligence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
