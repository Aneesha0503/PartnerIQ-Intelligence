import React, { useEffect, useState } from 'react';
import { X, Printer, Download, ShieldCheck, Building, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function ExecutiveDossierModal({ isOpen, onClose, companyId }) {
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && companyId) {
      setLoading(true);
      api.getExecutiveMemo(companyId)
        .then(data => setMemo(data))
        .catch(err => console.error("Memo fetch failed", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!memo) return;
    const blob = new Blob([JSON.stringify(memo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PartnerIQ_${memo.memo_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#161617] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden print:m-0 print:border-none print:shadow-none print:max-w-none print:h-auto">
        {/* Top Action Bar (hidden on print) */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-white/[0.08] print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 text-xs font-medium rounded-full bg-white/[0.06] text-[#ff9f0a] border border-white/[0.08] uppercase tracking-wider">
              Executive Dossier
            </span>
            <span className="text-xs text-[#86868b]">Partnership Decision Memo</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] border border-white/[0.08] text-[#f5f5f7] text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] text-[#86868b] hover:text-white flex items-center justify-center transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Memo Document Body */}
        <div className="flex-1 overflow-y-auto p-8 text-[#f5f5f7] print:p-0 print:bg-white print:text-black">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-[#86868b]">Compiling executive memorandum...</p>
            </div>
          ) : !memo ? (
            <div className="text-center py-24 text-[#86868b]">
              Failed to compile executive memo.
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Header */}
              <div className="border-b border-white/[0.1] pb-6 print:border-black">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-[#2997ff] font-semibold mb-1 print:text-blue-700">
                      PARTNERIQ // DECISION GOVERNANCE MEMO
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white print:text-black">
                      {memo.title}
                    </h1>
                  </div>
                  <div className="text-right text-xs text-[#86868b] print:text-slate-600 font-mono">
                    <div>{memo.memo_id}</div>
                    <div>{new Date(memo.generated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Executive Summary Statement */}
              <div className="p-5 rounded-2xl bg-[#1d1d1f]/70 border border-white/[0.08] print:bg-slate-100 print:border-slate-300">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] mb-2 print:text-blue-800">
                  Executive Verdict & Recommendation
                </h3>
                <p className="text-sm leading-relaxed text-[#f5f5f7] print:text-black">
                  {memo.executive_verdict_narrative}
                </p>
              </div>

              {/* Grid: Overview & Gate Audit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Candidate Profile */}
                <div className="p-5 rounded-2xl bg-[#1d1d1f]/50 border border-white/[0.06] print:border-slate-300">
                  <div className="flex items-center gap-2 mb-3 text-white print:text-black font-semibold text-xs">
                    <Building className="w-3.5 h-3.5 text-[#2997ff]" />
                    Entity Profile
                  </div>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-[#86868b]">Company:</dt>
                      <dd className="font-semibold text-white print:text-black">{memo.candidate_overview.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#86868b]">Headquarters:</dt>
                      <dd className="text-white print:text-black">{memo.candidate_overview.headquarters}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#86868b]">Scale / Employees:</dt>
                      <dd className="text-white print:text-black">{memo.candidate_overview.employee_count}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#86868b]">Funding Tier:</dt>
                      <dd className="text-white print:text-black">{memo.candidate_overview.funding_stage}</dd>
                    </div>
                  </dl>
                </div>

                {/* Gate Audit */}
                <div className="p-5 rounded-2xl bg-[#1d1d1f]/50 border border-white/[0.06] print:border-slate-300">
                  <div className="flex items-center gap-2 mb-3 text-white print:text-black font-semibold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" />
                    Mandatory Risk Gate Audit
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#86868b]">Gate Verdict:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                        memo.gate_audit.verdict === 'PASS'
                          ? 'bg-[#30d158]/15 text-[#30d158]'
                          : 'bg-[#ff453a]/15 text-[#ff453a]'
                      }`}>
                        {memo.gate_audit.verdict} ({memo.gate_audit.qualification})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">Safety Score:</span>
                      <span className="font-semibold text-white print:text-black">{memo.gate_audit.composite_risk_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">Mandatory Gates:</span>
                      <span className="font-semibold text-white print:text-black">{memo.gate_audit.rules_verified}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fit Scorecard */}
              <div className="p-5 rounded-2xl bg-[#1d1d1f]/50 border border-white/[0.06] print:border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-semibold text-xs text-white print:text-black">
                    <Layers className="w-3.5 h-3.5 text-[#bf5af2]" />
                    Weighted Partnership Fit Scorecard
                  </div>
                  <span className="text-2xl font-bold text-[#2997ff] print:text-blue-700">
                    {memo.fit_scorecard.composite_fit_score}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="text-[10px] text-[#86868b] uppercase font-semibold">Strategic</div>
                    <div className="text-base font-semibold text-white mt-1">
                      {memo.fit_scorecard.strategic_score}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="text-[10px] text-[#86868b] uppercase font-semibold">Technical</div>
                    <div className="text-base font-semibold text-white mt-1">
                      {memo.fit_scorecard.technical_score}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="text-[10px] text-[#86868b] uppercase font-semibold">Market</div>
                    <div className="text-base font-semibold text-white mt-1">
                      {memo.fit_scorecard.market_score}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
