import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

export default function Module1Discovery({ onPartnerAnalyzed, onViewEvidence, onNavigateTab }) {
  const [searchQuery, setSearchQuery] = useState('Enterprise Cloud API and Infrastructure');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // New partner form state
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisError, setAnalysisError] = useState(null);
  const [lastAnalyzedResult, setLastAnalyzedResult] = useState(null);

  const sampleCompanies = [
    { name: 'Stripe', domain: 'stripe.com', industry: 'FinTech' },
    { name: 'Datadog', domain: 'datadoghq.com', industry: 'Observability' },
    { name: 'Cloudflare', domain: 'cloudflare.com', industry: 'Security & Edge' },
    { name: 'Snowflake', domain: 'snowflake.com', industry: 'Data Cloud' },
    { name: 'Supabase', domain: 'supabase.com', industry: 'Postgres & BaaS' },
    { name: 'Twilio', domain: 'twilio.com', industry: 'Communications API' },
  ];

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await api.searchPartners(searchQuery);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAnalyze = async (nameToUse, domainToUse, industryToUse) => {
    const targetName = nameToUse || companyName;
    if (!targetName.trim()) return;

    setAnalyzing(true);
    setAnalysisError(null);
    setLastAnalyzedResult(null);

    setAnalysisStep(1);
    const timer1 = setTimeout(() => setAnalysisStep(2), 600);
    const timer2 = setTimeout(() => setAnalysisStep(3), 1200);
    const timer3 = setTimeout(() => setAnalysisStep(4), 1800);

    try {
      const result = await api.analyzeCompany(
        targetName,
        domainToUse || domain,
        industryToUse || industry
      );
      setLastAnalyzedResult(result);
      if (onPartnerAnalyzed) {
        onPartnerAnalyzed(result.company_id);
      }
    } catch (err) {
      setAnalysisError(err.message || 'Analysis pipeline failed');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Apple-Style Hero Headline */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-medium text-[#2997ff] mb-4">
          <Sparkles className="w-3 h-3" />
          Autonomous Partner Intelligence
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#f5f5f7]">
          Partner evaluation. <br />
          <span className="apple-gradient-text">Powered by evidence.</span>
        </h1>
        <p className="mt-4 text-[17px] text-[#86868b] leading-relaxed max-w-2xl mx-auto">
          Discover prospective technology partners, harvest API architecture from live web sources,
          and enforce mandatory risk gating with zero manual due-diligence effort.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Evaluate Partner Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-7 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-2xl">
            <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#f5f5f7] tracking-tight">
                  Audit Candidate
                </h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Harvest live web evidence & evaluate fit
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-[#86868b] mb-1.5">
                  Company Name <span className="text-[#ff453a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Datadog, Cloudflare"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-white/[0.08] text-sm text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#86868b] mb-1.5">
                  Domain / URL (Optional)
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. datadoghq.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-white/[0.08] text-sm text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#86868b] mb-1.5">
                  Industry / Category (Optional)
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Cloud Security, FinTech, DevTools"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1d1d1f] border border-white/[0.08] text-sm text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff] transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={analyzing || !companyName.trim()}
                  className="w-full py-3 px-5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition active:scale-98"
                >
                  {analyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Auditing Web Sources...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Due Diligence</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Pipeline progress visualization */}
            {analyzing && (
              <div className="mt-5 p-4 rounded-2xl bg-[#1d1d1f] border border-white/[0.08] space-y-2 animate-in fade-in">
                <div className="text-[11px] font-semibold text-[#2997ff] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2997ff] animate-ping" />
                  Autonomous Pipeline Active
                </div>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${analysisStep >= 1 ? 'text-[#30d158]' : 'text-[#6e6e73]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Crawl web sources & capture evidence</span>
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 2 ? 'text-[#30d158]' : 'text-[#6e6e73]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Extract tech stack, APIs & leadership</span>
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 3 ? 'text-[#30d158]' : 'text-[#6e6e73]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Audit mandatory legal & compliance gates</span>
                  </div>
                  <div className={`flex items-center gap-2 ${analysisStep >= 4 ? 'text-[#30d158]' : 'text-[#6e6e73]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Compute dynamic weighted fit index</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {analysisError && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/20 text-[#ff453a] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Last Analyzed Banner */}
            {lastAnalyzedResult && (
              <div className="mt-5 p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.1] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#f5f5f7]">
                    {lastAnalyzedResult.company_profile?.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    lastAnalyzedResult.risk_evaluation?.gating_status === 'PASS'
                      ? 'bg-[#30d158]/15 text-[#30d158]'
                      : 'bg-[#ff453a]/15 text-[#ff453a]'
                  }`}>
                    {lastAnalyzedResult.risk_evaluation?.gating_status}
                  </span>
                </div>
                <div className="text-xs text-[#86868b]">
                  Fit Score: <strong className="text-white">{lastAnalyzedResult.fit_scores?.weighted_fit_score}%</strong>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onNavigateTab('module3')}
                    className="flex-1 py-1.5 px-3 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#f5f5f7] text-xs font-medium transition"
                  >
                    View Risk Gate
                  </button>
                  <button
                    onClick={() => onNavigateTab('module4')}
                    className="flex-1 py-1.5 px-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium transition"
                  >
                    View Fit Score
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Fast-Track Candidates */}
          <div className="p-6 rounded-3xl bg-[#161617] border border-white/[0.08]">
            <h4 className="text-xs font-medium text-[#86868b] uppercase tracking-wider mb-3">
              Explore Candidate Partners
            </h4>
            <div className="flex flex-wrap gap-2">
              {sampleCompanies.map((comp) => (
                <button
                  key={comp.name}
                  onClick={() => {
                    setCompanyName(comp.name);
                    setDomain(comp.domain);
                    setIndustry(comp.industry);
                    handleAnalyze(comp.name, comp.domain, comp.industry);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] border border-white/[0.08] text-xs text-[#f5f5f7] transition"
                >
                  <Building className="w-3 h-3 text-[#86868b]" />
                  <span>{comp.name}</span>
                  <Plus className="w-2.5 h-2.5 text-[#86868b]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Web Intelligence Search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-7 rounded-3xl bg-[#161617] border border-white/[0.08] shadow-2xl">
            <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#f5f5f7] tracking-tight">
                  Web Intelligence Stream
                </h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Probe live corporate sources for capability signals & disclosures
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#86868b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search industry or capabilities (e.g. payment gateway API, cloud observability)"
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#1d1d1f] border border-white/[0.08] text-sm text-[#f5f5f7] placeholder-[#6e6e73] focus:outline-none focus:border-[#2997ff] transition"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#2c2c2e] border border-white/[0.1] text-xs font-semibold text-[#f5f5f7] transition shrink-0"
              >
                {searching ? 'Querying...' : 'Search'}
              </button>
            </form>

            {/* Results Stream */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {searchResults.length === 0 && !searching && (
                <div className="text-center py-14 rounded-2xl border border-dashed border-white/[0.08] text-[#86868b] text-xs">
                  <Search className="w-6 h-6 mx-auto mb-2 text-[#6e6e73]" />
                  Enter a domain or industry query to probe live web intelligence.
                </div>
              )}

              {searching && (
                <div className="flex flex-col items-center justify-center py-14 space-y-2">
                  <div className="w-5 h-5 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#86868b]">Gathering source citations...</span>
                </div>
              )}

              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[#1d1d1f]/70 border border-white/[0.06] hover:border-white/[0.12] transition space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-xs font-semibold text-[#f5f5f7] group-hover:text-[#2997ff] transition">
                      {res.title}
                    </h4>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#86868b] hover:text-[#2997ff] shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-[#86868b] line-clamp-2 leading-relaxed">
                    {res.snippet}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px]">
                    <span className="text-[#6e6e73] truncate max-w-xs font-mono text-[10px]">
                      {res.url}
                    </span>
                    <button
                      onClick={() => {
                        const titleParts = res.title.split(/[-|–]/);
                        const guessedName = titleParts[0].trim();
                        setCompanyName(guessedName);
                        handleAnalyze(guessedName);
                      }}
                      className="inline-flex items-center gap-1 text-[#2997ff] hover:underline font-medium"
                    >
                      Audit Entity <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
