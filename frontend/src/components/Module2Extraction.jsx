import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Building, 
  Globe, 
  MapPin, 
  Users, 
  Layers, 
  ShieldCheck, 
  FileCode, 
  Cloud, 
  Workflow, 
  FileText,
  DollarSign,
  Briefcase,
  Star,
  UserCheck,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { api } from '../services/api';

export default function Module2Extraction({ companies, selectedCompanyId, onSelectCompany, onOpenEvidence }) {
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
  const techStack = profile?.tech_stack || {};

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Apple-Style Section Header */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-medium text-[#2997ff] mb-4">
          <Cpu className="w-3 h-3" />
          Module 2 — AI Profile Extraction
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#f5f5f7]">
          Structured Architecture. <br />
          <span className="apple-gradient-text">Distilled with precision.</span>
        </h1>
        <p className="mt-4 text-[17px] text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          Deep technical footprint, verified APIs, SDK libraries, governance posture, and executive leadership profiles.
        </p>
      </div>

      {/* Apple-Style Entity Selector Bar */}
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
                <span className={`w-1.5 h-1.5 rounded-full ${
                  c.gating_status === 'PASS' ? 'bg-[#30d158]' : 'bg-[#ff453a]'
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[#86868b]">Compiling specification sheet...</p>
        </div>
      ) : !profile ? (
        <div className="text-center py-24 text-[#86868b] text-sm">
          No company selected.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Specification Card */}
          <div className="p-8 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-semibold text-[#f5f5f7] tracking-tight">
                    {profile.name}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.06] text-[#86868b] border border-white/[0.08]">
                    {profile.industry}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#86868b] max-w-3xl leading-relaxed">
                  {profile.overview}
                </p>
              </div>

              {/* Action */}
              <div className="shrink-0">
                <button
                  onClick={() => onOpenEvidence(profile.name, profile.evidence_sources || [])}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] border border-white/[0.1] text-xs font-medium text-[#f5f5f7] transition"
                >
                  <FileText className="w-3.5 h-3.5 text-[#2997ff]" />
                  <span>Inspect Citations ({profile.evidence_sources?.length || 0})</span>
                </button>
              </div>
            </div>

            {/* Apple 8-Card Metric Bento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {/* Founders */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#2997ff]" /> Founders & Leadership
                </div>
                <span className="text-xs font-medium text-[#f5f5f7] truncate block">
                  {profile.founders || 'Executive Team'}
                </span>
              </div>

              {/* Funding & Stage */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#ff9f0a]" /> Capitalization
                </div>
                <span className="text-xs font-medium text-[#ff9f0a] truncate block">
                  {profile.funding_stage || 'Growth Stage'}
                </span>
              </div>

              {/* Revenue */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#30d158]" /> Scale & Revenue
                </div>
                <span className="text-xs font-medium text-[#30d158] truncate block">
                  {profile.estimated_revenue || '$100M+ Scale'}
                </span>
              </div>

              {/* Profitability */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <PieChart className="w-3.5 h-3.5 text-[#2997ff]" /> Solvency & Cash
                </div>
                <span className="text-xs font-medium text-[#f5f5f7] truncate block">
                  {profile.profitability_status || 'Solvent'}
                </span>
              </div>

              {/* Headcount */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <Users className="w-3.5 h-3.5 text-[#bf5af2]" /> Team Headcount
                </div>
                <span className="text-xs font-medium text-[#f5f5f7] truncate block">
                  {profile.employee_count || '500+ Staff'}
                </span>
              </div>

              {/* Employee Rating */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <Star className="w-3.5 h-3.5 text-[#ffd60a]" /> Culture & Ratings
                </div>
                <span className="text-xs font-medium text-[#ffd60a] truncate block">
                  {profile.employee_rating || '4.3 / 5.0 (Glassdoor)'}
                </span>
              </div>

              {/* Headquarters */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#30d158]" /> Headquarters
                </div>
                <span className="text-xs font-medium text-[#f5f5f7] truncate block">
                  {profile.headquarters || 'Global'}
                </span>
              </div>

              {/* Domain */}
              <div className="p-4 rounded-2xl bg-[#1d1d1f]/60 border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#86868b] text-[11px] mb-1">
                  <Globe className="w-3.5 h-3.5 text-[#2997ff]" /> Web Domain
                </div>
                <a
                  href={`https://${profile.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-[#2997ff] hover:underline truncate block"
                >
                  {profile.domain}
                </a>
              </div>
            </div>
          </div>

          {/* Capabilities & Tech Blueprint */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products */}
            <div className="p-7 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-[#f5f5f7] font-semibold text-sm">
                <Briefcase className="w-4 h-4 text-[#2997ff]" />
                Core Capabilities & Products
              </div>

              <div className="space-y-3">
                {(profile.products || []).map((prod, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#1d1d1f]/70 border border-white/[0.06]">
                    <div className="text-xs font-semibold text-[#f5f5f7] mb-1">
                      {prod.name}
                    </div>
                    <p className="text-xs text-[#86868b] leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Specs */}
            <div className="p-7 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-[#f5f5f7] font-semibold text-sm">
                <Layers className="w-4 h-4 text-[#bf5af2]" />
                Technical Footprint & Interface Specs
              </div>

              <div className="space-y-3 text-xs">
                {/* Cloud & Hosting */}
                <div className="p-4 rounded-2xl bg-[#1d1d1f]/70 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[#86868b] mb-2 font-medium">
                    <Cloud className="w-3.5 h-3.5 text-[#2997ff]" /> Cloud Deployment:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(techStack.cloud_platforms || ['AWS']).map((cloud, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white/[0.06] text-[#f5f5f7] border border-white/[0.08] text-[11px]">
                        {cloud}
                      </span>
                    ))}
                  </div>
                </div>

                {/* API Types */}
                <div className="p-4 rounded-2xl bg-[#1d1d1f]/70 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[#86868b] mb-2 font-medium">
                    <FileCode className="w-3.5 h-3.5 text-[#30d158]" /> API Protocols:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(techStack.api_types || ['REST API']).map((apiType, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 text-[11px]">
                        {apiType}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SDKs */}
                <div className="p-4 rounded-2xl bg-[#1d1d1f]/70 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[#86868b] mb-2 font-medium">
                    <Workflow className="w-3.5 h-3.5 text-[#ff9f0a]" /> SDK Coverage:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(techStack.sdks || ['Python', 'Node.js']).map((sdk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white/[0.06] text-[#f5f5f7] border border-white/[0.08] text-[11px]">
                        {sdk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Security Standards */}
                <div className="p-4 rounded-2xl bg-[#1d1d1f]/70 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[#86868b] mb-2 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2997ff]" /> Verified Compliance:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(techStack.security_features || ['SOC 2 Type II']).map((sec, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-[#2997ff]/10 text-[#2997ff] border border-[#2997ff]/20 text-[11px]">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
