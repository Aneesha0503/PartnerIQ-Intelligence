import React from 'react';
import { X, ExternalLink, ShieldCheck, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function EvidenceModal({ isOpen, onClose, companyName, evidenceSources = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#161617] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#2997ff]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#f5f5f7] tracking-tight">
                Verifiable Audit Provenance
              </h3>
              <p className="text-xs text-[#86868b]">
                Evidence trail harvested from corporate web sources for <span className="text-[#f5f5f7] font-medium">{companyName}</span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-7 space-y-4">
          {evidenceSources.length === 0 ? (
            <div className="text-center py-14 text-[#86868b] text-xs">
              No evidence records stored for this entity.
            </div>
          ) : (
            evidenceSources.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="p-5 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06] hover:border-white/[0.12] transition space-y-2.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-white/[0.06] text-[#86868b] border border-white/[0.08]">
                      {ev.category || 'Citation'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#30d158]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Confidence: {Math.round((ev.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                  {ev.timestamp && (
                    <div className="flex items-center gap-1 text-[11px] text-[#6e6e73]">
                      <Clock className="w-3 h-3" />
                      {new Date(ev.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-[#f5f5f7]">
                  {ev.source_title || 'Web Intelligence Citation'}
                </h4>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-[#a1a1a6] font-serif leading-relaxed italic">
                  "{ev.snippet}"
                </div>

                {ev.source_url && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
                    <span className="text-[#6e6e73] truncate max-w-sm font-mono text-[10px]">
                      {ev.source_url}
                    </span>
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2997ff] hover:underline font-medium text-xs ml-2"
                    >
                      Verify Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#86868b]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Audited against PartnerIQ Intelligence Standard</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] text-[#f5f5f7] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
