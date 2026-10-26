import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Sliders, 
  Compass, 
  Code2, 
  TrendingUp, 
  RotateCcw, 
  ShieldX
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_WEIGHTS = {
  strategic: 35,
  technical: 40,
  market: 25,
};

export default function Module4FitScoring({ companies, selectedCompanyId, onSelectCompany, onWeightsChanged }) {
  const [activeCompany, setActiveCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const targetId = selectedCompanyId || (companies.length > 0 ? companies[0].id : null);
    if (targetId) {
      loadCompanyDetails(targetId);
    }
  }, [selectedCompanyId, companies]);

  const loadCompanyDetails = async (id) => {
    setLoading(true);
    try {
      const data = await api.getCompanyDetails(id);
      setActiveCompany(data);
      if (data?.evaluation?.fit_scores?.weights_applied) {
        setWeights(data.evaluation.fit_scores.weights_applied);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightSlider = (dimension, value) => {
    const val = parseFloat(value);
    const newWeights = { ...weights, [dimension]: val };
    setWeights(newWeights);
  };

  const applyWeightsRecalculation = async () => {
    if (!activeCompany?.company_profile?.id) return;
    setRecalculating(true);
    try {
      const updated = await api.recalculateFit(activeCompany.company_profile.id, weights);
      setActiveCompany(prev => ({
        ...prev,
        evaluation: {
          ...prev.evaluation,
          fit_scores: updated
        }
      }));
      if (onWeightsChanged) {
        onWeightsChanged(weights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const resetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    if (activeCompany?.company_profile?.id) {
      api.recalculateFit(activeCompany.company_profile.id, DEFAULT_WEIGHTS).then(updated => {
        setActiveCompany(prev => ({
          ...prev,
          evaluation: {
            ...prev.evaluation,
            fit_scores: updated
          }
        }));
      });
    }
  };

  const profile = activeCompany?.company_profile;
  const evaluation = activeCompany?.evaluation;
  const fitScores = evaluation?.fit_scores;
  const riskEval = evaluation?.risk_evaluation;

  const isDisqualified = riskEval?.gating_status === 'FAIL';
  const dimensions = fitScores?.dimensions || {};
  const strategic = dimensions.strategic || { score: 0, contribution: 0, submetrics: {} };
  const technical = dimensions.technical || { score: 0, contribution: 0, submetrics: {} };
  const market = dimensions.market || { score: 0, contribution: 0, submetrics: {} };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Apple Section Header */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-medium text-[#2997ff] mb-4">
          <BarChart2 className="w-3 h-3" />
          Module 4 — Quantitative Fit Scoring
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f5f5f7]">
          Calibrated alignment. <br />
          <span className="apple-gradient-text">Dynamic by design.</span>
        </h1>
        <p className="mt-4 text-[17px] text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          Multi-dimensional mathematical fit scores across Strategic, Technical, and Market viability with real-time slider simulation.
        </p>
      </div>

      {/* Entity Selector Ribbon */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="p-1 rounded-full bg-[#161617] border border-white/[0.08] flex items-center gap-1">
          {companies.map((c) => {
            const isSelected = (profile?.id === c.id);
            return (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCompany(c.id);
                  loadCompanyDetails(c.id);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
                  isSelected
                    ? 'bg-[#2c2c2e] text-[#f5f5f7] shadow-sm'
                    : 'text-[#86868b] hover:text-[#f5f5f7]'
                }`}
              >
                <span>{c.name}</span>
                <span className="text-[11px] font-medium text-[#f5f5f7]">{c.weighted_fit_score}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[#86868b]">Calculating mathematical fit scores...</p>
        </div>
      ) : !fitScores ? (
        <div className="text-center py-24 text-[#86868b] text-sm">
          No fit score available.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Score & Tier Banner */}
          <div className="p-8 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#86868b]">
                    COMPOSITE PARTNERSHIP FIT
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                    isDisqualified 
                      ? 'bg-[#ff453a]/15 text-[#ff453a]' 
                      : 'bg-[#2997ff]/15 text-[#2997ff]'
                  }`}>
                    {fitScores.recommendation_level}
                  </span>
                </div>
                <h2 className="text-3xl font-semibold text-[#f5f5f7] tracking-tight">
                  {profile.name}
                </h2>
                <div className="text-sm font-medium text-[#86868b]">
                  {fitScores.partnership_tier}
                </div>
              </div>

              {/* Minimalist Apple-style Fit Score Gauge */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-[#1d1d1f] border border-white/[0.08] shadow-inner">
                  <div className="text-center">
                    <span className="text-4xl font-semibold tracking-tight text-[#f5f5f7]">
                      {fitScores.weighted_fit_score}
                    </span>
                    <span className="text-xs font-semibold text-[#2997ff] block -mt-1">%</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-[#86868b]">
                  <div>Strategic: <strong className="text-[#f5f5f7]">{strategic.score}%</strong></div>
                  <div>Technical: <strong className="text-[#f5f5f7]">{technical.score}%</strong></div>
                  <div>Market: <strong className="text-[#f5f5f7]">{market.score}%</strong></div>
                </div>
              </div>
            </div>

            {/* Disqualification warning notice */}
            {isDisqualified && (
              <div className="mt-4 p-4 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/20 text-[#ff453a] text-xs flex items-center gap-2.5">
                <ShieldX className="w-5 h-5 shrink-0" />
                <div>
                  <strong>Mandatory Risk Blocker:</strong> This entity failed mandatory criteria in Module 3. While the algorithmic fit score is {fitScores.weighted_fit_score}%, executive status is classified as <strong>DISQUALIFIED</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Weight Configuration Card */}
          <div className="p-8 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f5f5f7]">
                <Sliders className="w-4 h-4 text-[#2997ff]" />
                Dynamic Weight Calibration
              </div>
              <button
                onClick={resetWeights}
                className="inline-flex items-center gap-1 text-xs text-[#86868b] hover:text-[#f5f5f7] transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strategic Slider */}
              <div className="p-5 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#2997ff] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" /> Strategic Weight
                  </span>
                  <span className="font-semibold text-white">
                    {Math.round(weights.strategic)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={weights.strategic}
                  onChange={(e) => handleWeightSlider('strategic', e.target.value)}
                  className="w-full cursor-pointer"
                />
                <div className="text-[11px] text-[#6e6e73]">
                  Objectives synergy, mutual customer overlap, co-selling.
                </div>
              </div>

              {/* Technical Slider */}
              <div className="p-5 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#30d158] flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> Technical Weight
                  </span>
                  <span className="font-semibold text-white">
                    {Math.round(weights.technical)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={weights.technical}
                  onChange={(e) => handleWeightSlider('technical', e.target.value)}
                  className="w-full cursor-pointer"
                />
                <div className="text-[11px] text-[#6e6e73]">
                  API maturity, SDK coverage, architectural compatibility.
                </div>
              </div>

              {/* Market Slider */}
              <div className="p-5 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#bf5af2] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Market Weight
                  </span>
                  <span className="font-semibold text-white">
                    {Math.round(weights.market)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={weights.market}
                  onChange={(e) => handleWeightSlider('market', e.target.value)}
                  className="w-full cursor-pointer"
                />
                <div className="text-[11px] text-[#6e6e73]">
                  Market momentum, brand reputation, customer sentiment.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={applyWeightsRecalculation}
                disabled={recalculating}
                className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-sm disabled:opacity-40 transition"
              >
                {recalculating ? 'Recalculating...' : 'Apply Calibration'}
              </button>
            </div>
          </div>

          {/* 3 Pillars Deep-Dive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strategic */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2997ff]">
                  <Compass className="w-4 h-4" /> Strategic Alignment
                </div>
                <span className="text-xl font-semibold text-white">{strategic.score}%</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {Object.entries(strategic.submetrics || {}).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[#86868b] capitalize text-[11px]">
                      <span>{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{val}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-[#2c2c2e] overflow-hidden">
                      <div className="h-full bg-[#2997ff] rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#30d158]">
                  <Code2 className="w-4 h-4" /> Technical Compatibility
                </div>
                <span className="text-xl font-semibold text-white">{technical.score}%</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {Object.entries(technical.submetrics || {}).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[#86868b] capitalize text-[11px]">
                      <span>{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{val}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-[#2c2c2e] overflow-hidden">
                      <div className="h-full bg-[#30d158] rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#bf5af2]">
                  <TrendingUp className="w-4 h-4" /> Market Viability
                </div>
                <span className="text-xl font-semibold text-white">{market.score}%</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {Object.entries(market.submetrics || {}).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[#86868b] capitalize text-[11px]">
                      <span>{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{val}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-[#2c2c2e] overflow-hidden">
                      <div className="h-full bg-[#bf5af2] rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
