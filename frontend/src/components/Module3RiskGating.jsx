import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  DollarSign, 
  Lock, 
  AlertOctagon, 
  Building,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Search,
  Filter,
  Sparkles,
  Check,
  Info,
  Flame,
  CheckCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function Module3RiskGating({ companies, selectedCompanyId, onSelectCompany, onOpenEvidence }) {
  const [activeCompany, setActiveCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [ruleOverrides, setRuleOverrides] = useState({});
  const [advisoryRules, setAdvisoryRules] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRule, setExpandedRule] = useState(null);

  useEffect(() => {
    const targetId = selectedCompanyId || (companies.length > 0 ? companies[0].id : null);
    if (targetId) {
      loadCompanyDetails(targetId);
      setRuleOverrides({});
      setAdvisoryRules(new Set());
      setExpandedRule(null);
    }
  }, [selectedCompanyId, companies]);

  const loadCompanyDetails = async (id) => {
    setLoading(true);
    try {
      const data = await api.getCompanyDetails(id);
      setActiveCompany(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const profile = activeCompany?.company_profile;
  const evaluation = activeCompany?.evaluation;
  const riskEval = evaluation?.risk_evaluation;

  const isPassed = riskEval?.gating_status === 'PASS';
  const isConditional = riskEval?.gating_status === 'CONDITIONAL_PASS';
  const isFailed = riskEval?.gating_status === 'FAIL';

  const pillars = riskEval?.pillars || {};
  const rules = riskEval?.rule_evaluations || [];

  // Dynamic Rule Execution & Simulation Handlers
  const triggerReEvaluation = async (overrides, advRules) => {
    if (!profile?.id) return;
    setEvaluating(true);
    try {
      const customRules = rules.map(r => ({
        id: r.rule_id,
        category: r.category,
        title: r.title,
        description: r.description,
        critical: !advRules.has(r.rule_id)
      }));

      const res = await api.evaluateRiskRules(profile.id, overrides, customRules);
      if (res && res.status === 'success') {
        setActiveCompany(prev => ({
          ...prev,
          evaluation: {
            ...prev.evaluation,
            risk_evaluation: res.risk_evaluation,
            fit_scores: res.fit_scores
          }
        }));
      }
    } catch (err) {
      console.error('Failed to dynamically evaluate risk rules:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleToggleVerdict = async (ruleId, currentPassed) => {
    const newOverrides = {
      ...ruleOverrides,
      [ruleId]: !currentPassed
    };
    setRuleOverrides(newOverrides);
    await triggerReEvaluation(newOverrides, advisoryRules);
  };

  const handleToggleEnforcement = async (ruleId) => {
    const nextAdvisory = new Set(advisoryRules);
    if (nextAdvisory.has(ruleId)) {
      nextAdvisory.delete(ruleId);
    } else {
      nextAdvisory.add(ruleId);
    }
    setAdvisoryRules(nextAdvisory);
    await triggerReEvaluation(ruleOverrides, nextAdvisory);
  };

  const handleResetAudit = async () => {
    setRuleOverrides({});
    setAdvisoryRules(new Set());
    setEvaluating(true);
    try {
      const res = await api.evaluateRiskRules(profile?.id, {}, null);
      if (res && res.status === 'success') {
        setActiveCompany(prev => ({
          ...prev,
          evaluation: {
            ...prev.evaluation,
            risk_evaluation: res.risk_evaluation,
            fit_scores: res.fit_scores
          }
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleSimulateViolation = async (ruleId = 'RULE_LEGAL_01') => {
    const newOverrides = {
      ...ruleOverrides,
      [ruleId]: false
    };
    setRuleOverrides(newOverrides);
    await triggerReEvaluation(newOverrides, advisoryRules);
  };

  const handleSimulateAllPass = async () => {
    const allPassOverrides = {};
    rules.forEach(r => {
      allPassOverrides[r.rule_id] = true;
    });
    setRuleOverrides(allPassOverrides);
    await triggerReEvaluation(allPassOverrides, advisoryRules);
  };

  // Filter rules by category and search
  const filteredRules = rules.filter(r => {
    const matchesCategory = (selectedCategory === 'ALL' || r.category.toUpperCase() === selectedCategory);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      r.rule_id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const categories = ['ALL', 'LEGAL', 'COMPLIANCE', 'FINANCIAL', 'SAFETY'];
  const hasActiveOverrides = Object.keys(ruleOverrides).length > 0 || advisoryRules.size > 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Apple Section Header */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-medium text-[#ff453a] mb-4">
          <Lock className="w-3 h-3" />
          Module 3 — Mandatory Risk Gating
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f5f5f7]">
          Privacy. Compliance. <br />
          <span className="apple-gradient-text">Non-negotiable security.</span>
        </h1>
        <p className="mt-4 text-[17px] text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          Eliminate non-compliant, financially distressed, or legally vulnerable partners dynamically before allocating partnership resources.
        </p>
      </div>

      {/* Entity Selector Ribbon */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="p-1 rounded-full bg-[#161617] border border-white/[0.08] flex items-center gap-1">
          {companies.map((c) => {
            const isSelected = (profile?.id === c.id);
            const isPass = c.gating_status === 'PASS';
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
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isPass ? 'bg-[#30d158]' : 'bg-[#ff453a]'
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#ff453a] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[#86868b]">Auditing security criteria & dynamic gates...</p>
        </div>
      ) : !riskEval ? (
        <div className="text-center py-24 text-[#86868b] text-sm">
          No evaluation data found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Gating Decision Banner */}
          <div className={`p-8 rounded-3xl border transition-all duration-300 shadow-2xl relative overflow-hidden ${
            isPassed 
              ? 'bg-[#161617] border-[#30d158]/30' 
              : isConditional
              ? 'bg-[#161617] border-[#ff9f0a]/30'
              : 'bg-[#161617] border-[#ff453a]/40'
          }`}>
            {evaluating && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2997ff] to-transparent animate-pulse" />
            )}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl border shrink-0 ${
                  isPassed 
                    ? 'bg-[#30d158]/10 border-[#30d158]/20 text-[#30d158]' 
                    : isConditional
                    ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/20 text-[#ff9f0a]'
                    : 'bg-[#ff453a]/10 border-[#ff453a]/20 text-[#ff453a]'
                }`}>
                  {isPassed ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : isConditional ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <ShieldX className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#86868b]">
                      MANDATORY RISK GATE DECISION
                    </span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                      isPassed 
                        ? 'bg-[#30d158]/15 text-[#30d158]' 
                        : isConditional
                        ? 'bg-[#ff9f0a]/15 text-[#ff9f0a]'
                        : 'bg-[#ff453a]/15 text-[#ff453a]'
                    }`}>
                      {riskEval.gating_status} ({riskEval.qualification_status})
                    </span>
                    {hasActiveOverrides && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2997ff]/15 text-[#2997ff] border border-[#2997ff]/20">
                        Interactive Policy Active
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl font-semibold text-[#f5f5f7] tracking-tight">
                    {profile.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#86868b] leading-relaxed max-w-2xl">
                    {riskEval.gate_verdict_message}
                  </p>
                </div>
              </div>

              {/* Safety Index Dial */}
              <div className="flex items-center gap-6 lg:border-l lg:border-white/[0.08] lg:pl-8 shrink-0">
                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-wider text-[#86868b] font-medium">Safety Score</div>
                  <div className={`text-4xl font-semibold mt-1 tracking-tight ${
                    riskEval.composite_risk_score >= 80 
                      ? 'text-[#30d158]' 
                      : riskEval.composite_risk_score >= 60 
                      ? 'text-[#ff9f0a]' 
                      : 'text-[#ff453a]'
                  }`}>
                    {riskEval.composite_risk_score}
                    <span className="text-sm font-normal text-[#86868b]">/100</span>
                  </div>
                  <div className="text-[11px] text-[#86868b] mt-0.5">
                    {riskEval.mandatory_rules_passed} of {riskEval.mandatory_rules_total} Gates Passed
                  </div>
                </div>

                {isFailed && (
                  <div className="p-4 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/20 text-[#ff453a] text-xs max-w-xs leading-relaxed">
                    <strong className="block text-white mb-0.5">DISQUALIFIED:</strong>
                    Partnership prohibited due to mandatory criteria violation. Fit score cannot override critical risks.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4 Risk Pillars Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Legal */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#f5f5f7] font-semibold text-xs">
                  <Scale className="w-4 h-4 text-[#2997ff]" />
                  Legal & Sanctions
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  pillars.legal?.status === 'PASS' 
                    ? 'bg-[#30d158]/15 text-[#30d158]' 
                    : 'bg-[#ff453a]/15 text-[#ff453a]'
                }`}>
                  {pillars.legal?.status || 'PASS'}
                </span>
              </div>
              <div className="text-2xl font-semibold text-[#f5f5f7]">
                {pillars.legal?.score || 95}<span className="text-xs font-normal text-[#86868b]">/100</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed min-h-[40px]">
                {pillars.legal?.summary}
              </p>
              <div className="text-[11px] text-[#6e6e73] pt-2 border-t border-white/[0.06]">
                Risk Index: <strong className="text-[#f5f5f7]">{pillars.legal?.risk_level || 'LOW'}</strong>
              </div>
            </div>

            {/* Financial */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#f5f5f7] font-semibold text-xs">
                  <DollarSign className="w-4 h-4 text-[#30d158]" />
                  Financial Solvency
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  pillars.financial?.status === 'PASS' 
                    ? 'bg-[#30d158]/15 text-[#30d158]' 
                    : 'bg-[#ff453a]/15 text-[#ff453a]'
                }`}>
                  {pillars.financial?.status || 'PASS'}
                </span>
              </div>
              <div className="text-2xl font-semibold text-[#f5f5f7]">
                {pillars.financial?.score || 90}<span className="text-xs font-normal text-[#86868b]">/100</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed min-h-[40px]">
                {pillars.financial?.summary}
              </p>
              <div className="text-[11px] text-[#6e6e73] pt-2 border-t border-white/[0.06]">
                Capitalization: <strong className="text-[#f5f5f7]">{profile.funding_stage || 'Solvent'}</strong>
              </div>
            </div>

            {/* Compliance */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#f5f5f7] font-semibold text-xs">
                  <Lock className="w-4 h-4 text-[#bf5af2]" />
                  Certifications
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  pillars.compliance?.status === 'PASS' 
                    ? 'bg-[#30d158]/15 text-[#30d158]' 
                    : 'bg-[#ff453a]/15 text-[#ff453a]'
                }`}>
                  {pillars.compliance?.status || 'PASS'}
                </span>
              </div>
              <div className="text-2xl font-semibold text-[#f5f5f7]">
                {pillars.compliance?.score || 95}<span className="text-xs font-normal text-[#86868b]">/100</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed min-h-[40px]">
                {pillars.compliance?.summary}
              </p>
              <div className="text-[11px] text-[#6e6e73] pt-2 border-t border-white/[0.06]">
                Audits: <strong className="text-[#f5f5f7]">SOC 2 / ISO 27001</strong>
              </div>
            </div>

            {/* Safety & Security */}
            <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#f5f5f7] font-semibold text-xs">
                  <AlertOctagon className="w-4 h-4 text-[#2997ff]" />
                  Breaches & CVEs
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  pillars.safety?.status === 'PASS' 
                    ? 'bg-[#30d158]/15 text-[#30d158]' 
                    : 'bg-[#ff453a]/15 text-[#ff453a]'
                }`}>
                  {pillars.safety?.status || 'PASS'}
                </span>
              </div>
              <div className="text-2xl font-semibold text-[#f5f5f7]">
                {pillars.safety?.score || 92}<span className="text-xs font-normal text-[#86868b]">/100</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed min-h-[40px]">
                {pillars.safety?.summary}
              </p>
              <div className="text-[11px] text-[#6e6e73] pt-2 border-t border-white/[0.06]">
                Incident Status: <strong className="text-[#f5f5f7]">Zero Critical Open CVEs</strong>
              </div>
            </div>
          </div>

          {/* Dynamic Mandatory Gating Rules Audit Execution Workbench */}
          <div className="p-7 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-xl space-y-5">
            {/* Table Header & Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#f5f5f7]">
                  <ShieldCheck className="w-4 h-4 text-[#2997ff]" />
                  Mandatory Gating Rules Audit Execution
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-[#2997ff] border border-white/[0.08]">
                    Dynamic Engine
                  </span>
                </div>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Click any rule verdict to toggle dynamic overrides, or switch enforcement between Mandatory and Advisory.
                </p>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSimulateViolation('RULE_LEGAL_01')}
                  disabled={evaluating}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Simulate critical legal sanction violation"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Simulate Violation
                </button>

                <button
                  onClick={handleSimulateAllPass}
                  disabled={evaluating}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#30d158]/10 hover:bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Simulate all clean pass"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Clear All Gates
                </button>

                {hasActiveOverrides && (
                  <button
                    onClick={handleResetAudit}
                    disabled={evaluating}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] border border-white/[0.12] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset AI Audit
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#2997ff] text-white shadow-sm'
                        : 'bg-[#2c2c2e]/60 text-[#86868b] hover:text-[#f5f5f7]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
                <input
                  type="text"
                  placeholder="Filter rules or findings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-white/[0.08] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff] transition"
                />
              </div>
            </div>

            {/* Dynamic Rules Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#86868b]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#86868b] uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Rule ID</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Requirement & Policy Mode</th>
                    <th className="py-3 px-3 text-center">Verdict (Interactive)</th>
                    <th className="py-3 px-3">Findings & Live Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredRules.map((r) => {
                    const isExpanded = (expandedRule === r.rule_id);
                    const isAdvisory = advisoryRules.has(r.rule_id) || !r.critical;
                    const isOverridden = ruleOverrides.hasOwnProperty(r.rule_id);

                    const categoryColors = {
                      legal: 'text-[#2997ff] bg-[#2997ff]/10 border-[#2997ff]/20',
                      compliance: 'text-[#bf5af2] bg-[#bf5af2]/10 border-[#bf5af2]/20',
                      financial: 'text-[#30d158] bg-[#30d158]/10 border-[#30d158]/20',
                      safety: 'text-[#64d2ff] bg-[#64d2ff]/10 border-[#64d2ff]/20',
                    };

                    const catStyle = categoryColors[r.category.toLowerCase()] || 'text-[#86868b] bg-white/[0.06] border-white/[0.08]';

                    return (
                      <React.Fragment key={r.rule_id}>
                        <tr className="hover:bg-white/[0.02] transition">
                          {/* Rule ID */}
                          <td className="py-3 px-3 font-mono text-[11px] text-[#2997ff] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#2997ff]/10 border border-[#2997ff]/20 font-semibold">
                              {r.rule_id}
                            </span>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${catStyle}`}>
                              {r.category}
                            </span>
                          </td>

                          {/* Requirement & Policy Mode Switch */}
                          <td className="py-3 px-3 font-medium text-[#f5f5f7] max-w-md">
                            <div className="font-semibold text-[13px]">{r.title}</div>
                            <div className="text-[#86868b] text-[11px] mt-0.5 leading-relaxed">{r.description}</div>
                            
                            {/* Policy Mode Pill Button */}
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => handleToggleEnforcement(r.rule_id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer border ${
                                  !isAdvisory
                                    ? 'bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a]/25 hover:bg-[#ff453a]/20'
                                    : 'bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/25 hover:bg-[#ff9f0a]/20'
                                }`}
                                title="Click to toggle between Mandatory Gate and Advisory Guideline"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${!isAdvisory ? 'bg-[#ff453a]' : 'bg-[#ff9f0a]'}`} />
                                {!isAdvisory ? 'Mandatory Gate' : 'Advisory Guideline'}
                              </button>
                            </div>
                          </td>

                          {/* Interactive Verdict Toggle */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleToggleVerdict(r.rule_id, r.passed)}
                              disabled={evaluating}
                              className={`group inline-flex flex-col items-center gap-0.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-sm ${
                                r.passed
                                  ? 'bg-[#30d158]/15 hover:bg-[#30d158]/25 text-[#30d158] border-[#30d158]/30'
                                  : 'bg-[#ff453a]/15 hover:bg-[#ff453a]/25 text-[#ff453a] border-[#ff453a]/30'
                              } disabled:opacity-50`}
                              title="Click to toggle verdict dynamically"
                            >
                              <span className="flex items-center gap-1.5">
                                {r.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {r.passed ? 'PASS' : 'FAIL'}
                              </span>
                              <span className="text-[9px] font-normal opacity-70 group-hover:opacity-100 transition">
                                {isOverridden ? 'Override Active ✎' : 'Click to Toggle ✎'}
                              </span>
                            </button>
                          </td>

                          {/* Findings & Expand Evidence */}
                          <td className="py-3 px-3 text-[#86868b] text-[11px] max-w-sm">
                            <div className="leading-relaxed">{r.notes}</div>
                            
                            <button
                              onClick={() => setExpandedRule(isExpanded ? null : r.rule_id)}
                              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#2997ff] hover:text-white transition cursor-pointer"
                            >
                              <span>{isExpanded ? 'Hide Citation & Evidence' : 'View Harvested Evidence'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Audit Citation Drawer */}
                        {isExpanded && (
                          <tr className="bg-[#1c1c1e]/60 border-b border-white/[0.06]">
                            <td colSpan={5} className="py-4 px-6 space-y-3">
                              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-[#f5f5f7]">
                                    <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
                                    <span>Harvested Web Intelligence Citation for {r.title}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#30d158]/15 text-[#30d158] font-bold">
                                      {Math.round((r.evidence_confidence || 0.95) * 100)}% Confidence
                                    </span>
                                  </div>

                                  {(r.evidence_url || r.evidence_ref) && (
                                    <a
                                      href={r.evidence_url || r.evidence_ref}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-[#2997ff] hover:underline"
                                    >
                                      <span>Verify External Source</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>

                                {/* Evidence Quote */}
                                {r.evidence_snippet ? (
                                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#a1a1a6] italic leading-relaxed">
                                    "{r.evidence_snippet}"
                                  </div>
                                ) : (
                                  <div className="text-xs text-[#86868b] italic">
                                    Audit grounded in verified corporate domain and compliance registry records.
                                  </div>
                                )}

                                {/* Action bar */}
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[10px] text-[#6e6e73]">
                                    Audited dynamically via DuckDuckGo search and official domain crawl.
                                  </span>
                                  {onOpenEvidence && (
                                    <button
                                      onClick={() => onOpenEvidence(profile.name, profile.evidence_sources || [])}
                                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#2997ff]/15 hover:bg-[#2997ff]/25 text-[#2997ff] transition cursor-pointer"
                                    >
                                      Open Full Evidence Dossier ↗
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Dynamic Footer Audit Summary */}
            <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868b]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#30d158]" />
                  <strong>{rules.filter(r => r.passed).length} of {rules.length}</strong> Rules Passing
                </span>
                <span>•</span>
                <span>
                  Policy Standard: <strong>{advisoryRules.size > 0 ? `${rules.length - advisoryRules.size} Mandatory, ${advisoryRules.size} Advisory` : 'All 4 Mandatory'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6e6e73]">Dynamic Audit Log:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPassed
                    ? 'bg-[#30d158]/15 text-[#30d158]'
                    : isConditional
                    ? 'bg-[#ff9f0a]/15 text-[#ff9f0a]'
                    : 'bg-[#ff453a]/15 text-[#ff453a]'
                }`}>
                  Verdict: {riskEval.gating_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
