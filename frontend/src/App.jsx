import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Module1Discovery from './components/Module1Discovery';
import Module2Extraction from './components/Module2Extraction';
import Module3RiskGating from './components/Module3RiskGating';
import Module4FitScoring from './components/Module4FitScoring';
import Module5DecisionMatrix from './components/Module5DecisionMatrix';
import EvidenceModal from './components/EvidenceModal';
import ExecutiveDossierModal from './components/ExecutiveDossierModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import NewPartnerModal from './components/NewPartnerModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('module1');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [firebaseStatus, setFirebaseStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceModalData, setEvidenceModalData] = useState({ companyName: '', evidenceSources: [] });

  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [dossierCompanyId, setDossierCompanyId] = useState(null);

  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);
  const [newPartnerModalOpen, setNewPartnerModalOpen] = useState(false);

  // Load initial data
  const fetchData = async () => {
    try {
      const [statusRes, companiesRes] = await Promise.all([
        api.getStatus().catch(() => null),
        api.getCompanies().catch(() => []),
      ]);

      if (statusRes?.firebase) {
        setFirebaseStatus(statusRes.firebase);
      }
      setCompanies(companiesRes || []);

      if (companiesRes && companiesRes.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(companiesRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePartnerAnalyzed = async (newCompanyId) => {
    await fetchData();
    if (newCompanyId) {
      setSelectedCompanyId(newCompanyId);
    }
  };

  const handleOpenEvidence = (companyName, evidenceSources) => {
    setEvidenceModalData({ companyName, evidenceSources });
    setEvidenceModalOpen(true);
  };

  const handleOpenDossier = (companyId) => {
    setDossierCompanyId(companyId);
    setDossierModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col font-sans selection:bg-[#0071e3]/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyCount={companies.length}
        onOpenNewPartnerModal={() => setNewPartnerModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 space-y-4">
            <div className="w-8 h-8 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#86868b]">Connecting to PartnerIQ Engine & Firestore...</p>
          </div>
        ) : (
          <>
            {activeTab === 'module1' && (
              <Module1Discovery
                onPartnerAnalyzed={handlePartnerAnalyzed}
                onViewEvidence={handleOpenEvidence}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'module2' && (
              <Module2Extraction
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={(id) => setSelectedCompanyId(id)}
                onOpenEvidence={handleOpenEvidence}
              />
            )}

            {activeTab === 'module3' && (
              <Module3RiskGating
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={(id) => setSelectedCompanyId(id)}
                onOpenEvidence={handleOpenEvidence}
              />
            )}

            {activeTab === 'module4' && (
              <Module4FitScoring
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={(id) => setSelectedCompanyId(id)}
                onWeightsChanged={() => fetchData()}
              />
            )}

            {activeTab === 'module5' && (
              <Module5DecisionMatrix
                companies={companies}
                onOpenEvidence={handleOpenEvidence}
                onOpenDossier={handleOpenDossier}
              />
            )}
          </>
        )}
      </main>

      {/* Apple-Style Minimalist Footer */}
      <footer className="border-t border-white/[0.08] bg-black py-8 text-xs text-[#86868b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          Copyright © 2026 PartnerIQ Inc. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        companyName={evidenceModalData.companyName}
        evidenceSources={evidenceModalData.evidenceSources}
      />

      <ExecutiveDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        companyId={dossierCompanyId}
      />

      <FirebaseConfigModal
        isOpen={firebaseModalOpen}
        onClose={() => setFirebaseModalOpen(false)}
        firebaseStatus={firebaseStatus}
      />

      <NewPartnerModal
        isOpen={newPartnerModalOpen}
        onClose={() => setNewPartnerModalOpen(false)}
        onPartnerAnalyzed={handlePartnerAnalyzed}
      />
    </div>
  );
}
