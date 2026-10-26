import React from 'react';
import { 
  Sparkles, 
  Search, 
  Cpu, 
  ShieldCheck, 
  BarChart2, 
  Layers, 
  Plus
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  companyCount, 
  onOpenNewPartnerModal
}) {
  const navTabs = [
    { id: 'module1', label: 'Discovery', icon: Search },
    { id: 'module2', label: 'AI Extraction', icon: Cpu },
    { id: 'module3', label: 'Risk Gating', icon: ShieldCheck },
    { id: 'module4', label: 'Fit Scoring', icon: BarChart2 },
    { id: 'module5', label: 'Compare Matrix', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full apple-nav-blur border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('module1')}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-white/15 to-white/5 border border-white/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-semibold tracking-tight text-[#f5f5f7]">
                Partner<span className="text-[#2997ff]">IQ</span>
              </span>
              <span className="text-[11px] font-normal text-[#86868b] hidden sm:inline">
                Intelligence
              </span>
            </div>
          </div>

          {/* Apple-Style Segmented Navigation Bar */}
          <nav className="hidden md:flex items-center p-0.5 rounded-full bg-[#161617]/90 border border-white/[0.08]">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2c2c2e] text-[#f5f5f7] shadow-sm'
                      : 'text-[#86868b] hover:text-[#f5f5f7]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2997ff]' : 'text-[#86868b]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Counter & CTA */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#86868b] hidden lg:inline font-normal">
              {companyCount} {companyCount === 1 ? 'Partner' : 'Partners'} Audited
            </span>

            <button
              onClick={onOpenNewPartnerModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium shadow-sm transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Evaluate</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="flex md:hidden overflow-x-auto space-x-1 py-1.5 scrollbar-none border-t border-white/[0.06]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#2c2c2e] text-white'
                    : 'text-[#86868b] hover:text-white'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-[#2997ff]' : 'text-[#86868b]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
