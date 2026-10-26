import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  ShieldX, 
  Download, 
  Sparkles, 
  Trophy, 
  Filter, 
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function Module5DecisionMatrix({ 
  companies, 
  onOpenEvidence, 
  onOpenDossier 
}) {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [weights, setWeights] = useState({
    strategic: 35,
    technical: 40,
    market: 25
  });
  const [filterQualifiedOnly, setFilterQualifiedOnly] = useState(false);

  useEffect(() => {
    const ids = companies.map(c => c.id);
    setSelectedIds(ids);
    loadMatrix(ids, weights);
  }, [companies]);

  const loadMatrix = async (companyIds, currentWeights) => {
    setLoading(true);
    try {
      const data = await api.getDecisionMatrix(companyIds, currentWeights);
      setMatrixData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (dim, value) => {
    const val = parseFloat(value);
    const newWeights = { ...weights, [dim]: val };
    setWeights(newWeights);
    loadMatrix(selectedIds, newWeights);
  };

  const handleToggleSelectCompany = (id) => {
    let updated;
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return;
      updated = selectedIds.filter(i => i !== id);
    } else {
      updated = [...selectedIds, id];
    }
    setSelectedIds(updated);
    loadMatrix(updated, weights);
  };

  const candidates = (matrixData?.candidates || []).filter(c => {
    if (filterQualifiedOnly) {
      return c.qualification_status === 'QUALIFIED';
    }
    return true;
  });

  const execSummary = matrixData?.executive_summary || {};

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Apple Section Header */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-medium text-[#ff9f0a] mb-4">
          <Layers className="w-3 h-3" />
          Module 5 — Executive Comparison
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f5f5f7]">
          Compare partners. <br />
          <span className="apple-gradient-text">Side by side.</span>
        </h1>
        <p className="mt-4 text-[17px] text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          Standardized executive scorecard with real-time weight simulation, evidence provenance, and board-ready dossier exports.
        </p>
      </div>

      {/* Apple Executive Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-[#ff9f0a] font-medium mb-1">
            <Crown className="w-4 h-4 text-[#ff9f0a]" /> Top Recommended
          </div>
          <div className="text-base font-semibold text-white truncate">
            {execSummary.top_recommendation || 'Evaluating...'}
          </div>
          <div className="text-[11px] text-[#86868b] mt-0.5">
            Fit Score: <strong className="text-white">{execSummary.top_score || 0}%</strong>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-[#30d158] font-medium mb-1">
            <Trophy className="w-4 h-4 text-[#30d158]" /> Technical Leader
          </div>
          <div className="text-base font-semibold text-white truncate">
            {execSummary.technical_leader || 'None'}
          </div>
          <div className="text-[11px] text-[#86868b] mt-0.5">
            Architectural & API maturity
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-[#2997ff] font-medium mb-1">
            <Sparkles className="w-4 h-4 text-[#2997ff]" /> Strategic Leader
          </div>
          <div className="text-base font-semibold text-white truncate">
            {execSummary.strategic_leader || 'None'}
          </div>
          <div className="text-[11px] text-[#86868b] mt-0.5">
            Ecosystem & leverage synergy
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-[#ff453a] font-medium mb-1">
            <ShieldX className="w-4 h-4 text-[#ff453a]" /> Risk Blocked
          </div>
          <div className="text-base font-semibold text-white">
            {execSummary.disqualified_count || 0} Entities
          </div>
          <div className="text-[11px] text-[#ff453a] mt-0.5">
            Failed Mandatory Gate
          </div>
        </div>
      </div>

      {/* Dynamic Weight Adjustment Controls inside Matrix */}
      <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f5f5f7]">
            <Sliders className="w-4 h-4 text-[#2997ff]" />
            Live Weight Tuning (Instantly Updates Comparison Ranks)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterQualifiedOnly(!filterQualifiedOnly)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                filterQualifiedOnly
                  ? 'bg-[#30d158]/15 border-[#30d158]/30 text-[#30d158]'
                  : 'bg-[#1d1d1f] border-white/[0.08] text-[#86868b] hover:text-white'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{filterQualifiedOnly ? 'Qualified Only' : 'Show All'}</span>
            </button>
            <button
              onClick={() => {
                const def = { strategic: 35, technical: 40, market: 25 };
                setWeights(def);
                loadMatrix(selectedIds, def);
              }}
              className="px-3 py-1 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] text-[#86868b] hover:text-white text-xs transition"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs pt-1">
          <div>
            <div className="flex justify-between text-[#86868b] mb-1.5">
              <span>Strategic Weight:</span>
              <span className="text-white font-medium">{Math.round(weights.strategic)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={weights.strategic}
              onChange={(e) => handleWeightChange('strategic', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#86868b] mb-1.5">
              <span>Technical Weight:</span>
              <span className="text-white font-medium">{Math.round(weights.technical)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={weights.technical}
              onChange={(e) => handleWeightChange('technical', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#86868b] mb-1.5">
              <span>Market Weight:</span>
              <span className="text-white font-medium">{Math.round(weights.market)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={weights.market}
              onChange={(e) => handleWeightChange('market', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Included Companies Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#86868b] font-medium uppercase text-[10px] shrink-0 mr-1">
          Compare:
        </span>
        {companies.map(c => {
          const isIncluded = selectedIds.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => handleToggleSelectCompany(c.id)}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition shrink-0 ${
                isIncluded
                  ? 'bg-white/[0.08] border-white/20 text-[#f5f5f7]'
                  : 'bg-[#161617] border-white/[0.04] text-[#6e6e73] line-through opacity-60'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Apple-Style Comparison Grid */}
      <div className="p-8 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#f5f5f7] tracking-tight">
              Executive Decision Matrix
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              Ranked dynamically by Weighted Fit Score
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-[#86868b]">Compiling comparative matrix...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#86868b]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#86868b] uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Risk Gate</th>
                  <th className="py-3 px-3">Weighted Fit</th>
                  <th className="py-3 px-3">Strategic</th>
                  <th className="py-3 px-3">Technical</th>
                  <th className="py-3 px-3">Market</th>
                  <th className="py-3 px-3">Evidence</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {candidates.map((c) => {
                  const isTop = c.rank === 1 && c.qualification_status === 'QUALIFIED';
                  const isFail = c.qualification_status === 'DISQUALIFIED';

                  return (
                    <tr
                      key={c.company_id}
                      className={`hover:bg-white/[0.02] transition ${
                        isTop ? 'bg-white/[0.02]' : isFail ? 'bg-[#ff453a]/[0.02]' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          {isTop ? (
                            <Crown className="w-4 h-4 text-[#ff9f0a] shrink-0" />
                          ) : (
                            <span className="w-5 text-center font-mono text-[#86868b]">#{c.rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Company Name & Specs */}
                      <td className="py-4 px-3">
                        <div className="font-semibold text-[#f5f5f7] text-sm">
                          {c.company_name}
                        </div>
                        <div className="text-[11px] text-[#86868b] mt-0.5">
                          {c.industry}
                        </div>
                      </td>

                      {/* Risk Gate Status */}
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.gating_status === 'PASS'
                            ? 'bg-[#30d158]/15 text-[#30d158]'
                            : c.gating_status === 'CONDITIONAL_PASS'
                            ? 'bg-[#ff9f0a]/15 text-[#ff9f0a]'
                            : 'bg-[#ff453a]/15 text-[#ff453a]'
                        }`}>
                          {c.gating_status === 'PASS' ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <ShieldX className="w-3 h-3" />
                          )}
                          {c.qualification_status}
                        </span>
                      </td>

                      {/* Weighted Fit Score */}
                      <td className="py-4 px-3">
                        <div className={`text-base font-semibold ${
                          isFail ? 'text-[#6e6e73] line-through' : 'text-[#f5f5f7]'
                        }`}>
                          {c.weighted_fit_score}%
                        </div>
                        <div className="text-[10px] text-[#86868b] truncate max-w-[130px]">
                          {c.partnership_tier}
                        </div>
                      </td>

                      {/* Strategic */}
                      <td className="py-4 px-3 font-medium text-white">
                        {c.strategic_score}%
                      </td>

                      {/* Technical */}
                      <td className="py-4 px-3 font-medium text-white">
                        {c.technical_score}%
                      </td>

                      {/* Market */}
                      <td className="py-4 px-3 font-medium text-white">
                        {c.market_score}%
                      </td>

                      {/* Evidence */}
                      <td className="py-4 px-3">
                        <button
                          onClick={() => onOpenEvidence(c.company_name, c.evidence_sources || [])}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] text-[11px] text-[#2997ff] border border-white/[0.08] transition"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{c.evidence_count} Citations</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-3 text-right">
                        <button
                          onClick={() => onOpenDossier(c.company_id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-sm transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
