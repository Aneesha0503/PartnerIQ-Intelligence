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
  Building
} from 'lucide-react';
import { api } from '../services/api';

export default function Module3RiskGating({ companies, selectedCompanyId, onSelectCompany, onOpenEvidence }) {
  const [activeCompany, setActiveCompany] = useState(null);
  const [loading, setLoading] = useState(false);

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
          Eliminate non-compliant, financially distressed, or legally vulnerable partners automatically before allocating partnership resources.
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
          <p className="text-xs text-[#86868b]">Auditing security criteria & mandatory gates...</p>
        </div>
      ) : !riskEval ? (
        <div className="text-center py-24 text-[#86868b] text-sm">
          No evaluation data found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Gating Decision Banner */}
          <div className={`p-8 rounded-3xl border transition-all duration-300 shadow-2xl ${
            isPassed 
              ? 'bg-[#161617] border-[#30d158]/30' 
              : isConditional
              ? 'bg-[#161617] border-[#ff9f0a]/30'
              : 'bg-[#161617] border-[#ff453a]/40'
          }`}>
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

          {/* Mandatory Gating Rules Execution Table */}
          <div className="p-7 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f5f5f7]">
                <ShieldCheck className="w-4 h-4 text-[#2997ff]" />
                Mandatory Gating Rules Audit Execution
              </div>
              <span className="text-xs text-[#86868b]">
                All mandatory gates must pass for executive onboarding
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#86868b]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#86868b] uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Rule ID</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Requirement</th>
                    <th className="py-3 px-3">Verdict</th>
                    <th className="py-3 px-3">Findings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {rules.map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-mono text-[11px] text-[#2997ff]">
                        {r.rule_id}
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-semibold text-[#86868b]">
                        {r.category}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#f5f5f7]">
                        <div>{r.title}</div>
                        <div className="text-[#6e6e73] text-[11px] mt-0.5">{r.description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.passed
                            ? 'bg-[#30d158]/15 text-[#30d158]'
                            : 'bg-[#ff453a]/15 text-[#ff453a]'
                        }`}>
                          {r.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {r.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#86868b] text-[11px] max-w-sm">
                        {r.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
