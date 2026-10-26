// PartnerIQ Frontend API Client

const API_BASE = '/api';

export const api = {
  // System status & Firebase
  getStatus: async () => {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
  },

  // Module 1: Discovery
  searchPartners: async (query, maxResults = 5) => {
    const res = await fetch(`${API_BASE}/discovery/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, max_results: maxResults }),
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  analyzeCompany: async (companyName, domain = null, industry = null, customWeights = null) => {
    const res = await fetch(`${API_BASE}/discovery/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: companyName,
        domain: domain || undefined,
        industry: industry || undefined,
        custom_weights: customWeights || undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Analysis failed');
    }
    return res.json();
  },

  // Companies
  getCompanies: async () => {
    const res = await fetch(`${API_BASE}/companies`);
    if (!res.ok) throw new Error('Failed to fetch companies');
    return res.json();
  },

  getCompanyDetails: async (companyId) => {
    const res = await fetch(`${API_BASE}/companies/${companyId}`);
    if (!res.ok) throw new Error('Failed to fetch company details');
    return res.json();
  },

  deleteCompany: async (companyId) => {
    const res = await fetch(`${API_BASE}/companies/${companyId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete company');
    return res.json();
  },

  // Module 4: Fit Scorer Recalculation
  recalculateFit: async (companyId, weights) => {
    const res = await fetch(`${API_BASE}/fit-scorer/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId, weights }),
    });
    if (!res.ok) throw new Error('Recalculation failed');
    return res.json();
  },

  // Module 5: Decision Matrix
  getDecisionMatrix: async (companyIds = null, weights = null) => {
    const res = await fetch(`${API_BASE}/decision-matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_ids: companyIds, weights }),
    });
    if (!res.ok) throw new Error('Failed to generate matrix');
    return res.json();
  },

  getExecutiveMemo: async (companyId) => {
    const res = await fetch(`${API_BASE}/decision-matrix/memo/${companyId}`);
    if (!res.ok) throw new Error('Failed to generate memo');
    return res.json();
  },
};
