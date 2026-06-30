// Root component — Companies, AI Opportunities, Charts, and Pain Points tabs.

import { useState, useEffect, useCallback } from 'react';
import { getAllCompanies, getAllOpportunities, getCities } from './services/api';
import { exportCompaniesCSV, exportOpportunitiesMD } from './services/exportUtils';
import CompanyForm from './components/CompanyForm';
import CompanyList from './components/CompanyList';
import CompanyImport from './components/CompanyImport';
import CompanyFilters from './components/CompanyFilters';
import OpportunityForm from './components/OpportunityForm';
import OpportunityList from './components/OpportunityList';
import Charts from './components/Charts';
import PainPoints from './components/PainPoints';
import MarketMap from './components/MarketMap';

export default function App() {
  const [activeTab, setActiveTab] = useState('companies');

  // Companies state
  const [companies, setCompanies] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // Opportunities state
  const [opportunities, setOpportunities] = useState([]);
  const [isLoadingOpp, setIsLoadingOpp] = useState(true);

  // Fetch companies (called on mount and whenever filters change)
  const fetchCompanies = useCallback(async (activeFilters) => {
    setIsLoadingCompanies(true);
    try {
      const data = await getAllCompanies(activeFilters);
      setCompanies(data);
    } catch {
      // If the backend is down, stop the spinner instead of looping forever
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  // On first load: cities + opportunities (one-time, no deps that change)
  useEffect(() => {
    getCities().then(setCities).catch(() => {});
    getAllOpportunities()
      .then((data) => { setOpportunities(data); setIsLoadingOpp(false); })
      .catch(() => setIsLoadingOpp(false));
  }, []); // empty deps = runs exactly once on mount

  // Fetch companies whenever filters change (also runs on mount with filters = {})
  useEffect(() => {
    fetchCompanies(filters);
  }, [filters, fetchCompanies]);

  function handleCompanyAdded(c) { setCompanies((prev) => [c, ...prev]); }
  function handleCompanyDeleted(id) { setCompanies((prev) => prev.filter((c) => c.id !== id)); }
  function handleOpportunityAdded(o) { setOpportunities((prev) => [o, ...prev]); }
  function handleOpportunityDeleted(id) { setOpportunities((prev) => prev.filter((o) => o.id !== id)); }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-[var(--accent)]" />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PropAI Research Hub</h1>
            <p className="text-gray-400 text-sm mt-1">Market intelligence for building an AI product for HOAs</p>
          </div>
          <div className="flex gap-2 text-xs font-medium">
            <span className="bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full px-3 py-1">
              {companies.length} companies
            </span>
            <span className="bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full px-3 py-1">
              {opportunities.length} opportunities
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <TabButton label={`Companies (${companies.length})`} active={activeTab === 'companies'} onClick={() => setActiveTab('companies')} />
          <TabButton label={`AI Opportunities (${opportunities.length})`} active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} />
          <TabButton label="Charts" active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} />
          <TabButton label="Pain Points" active={activeTab === 'painpoints'} onClick={() => setActiveTab('painpoints')} />
          <TabButton label="Market Map" active={activeTab === 'marketmap'} onClick={() => setActiveTab('marketmap')} />
        </div>

        {/* Companies tab */}
        {activeTab === 'companies' && (
          <div className="flex gap-6 items-start">
            {/* Sidebar: filters + import + manual add */}
            <aside className="w-72 shrink-0 flex flex-col gap-4">
              <CompanyFilters
                filters={filters}
                onChange={setFilters}
                cities={cities}
                total={companies.length}
              />
              <CompanyImport onCompanyAdded={handleCompanyAdded} />
              <CompanyForm onCompanyAdded={handleCompanyAdded} />
            </aside>

            {/* Main: company list */}
            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel text={`${companies.length} companies${Object.values(filters).some(Boolean) ? ' (filtered)' : ''}`} />
                <button
                  onClick={() => exportCompaniesCSV(companies)}
                  className="text-xs text-[var(--accent)] hover:underline font-medium"
                >
                  Export CSV ↓
                </button>
              </div>
              {isLoadingCompanies ? (
                <div className="flex justify-center py-16">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                </div>
              ) : (
                <CompanyList companies={companies} onDelete={handleCompanyDeleted} />
              )}
            </main>
          </div>
        )}

        {/* Opportunities tab */}
        {activeTab === 'opportunities' && (
          <div className="flex gap-6 items-start">
            <aside className="w-72 shrink-0">
              <OpportunityForm onOpportunityAdded={handleOpportunityAdded} />
            </aside>
            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel text={`${opportunities.length} feature ideas — sorted by viability`} />
                <button
                  onClick={() => exportOpportunitiesMD(opportunities)}
                  className="text-xs text-[var(--accent)] hover:underline font-medium"
                >
                  Export Markdown ↓
                </button>
              </div>
              {isLoadingOpp ? (
                <div className="flex justify-center py-16">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                </div>
              ) : (
                <OpportunityList opportunities={opportunities} onDelete={handleOpportunityDeleted} />
              )}
            </main>
          </div>
        )}

        {/* Charts tab */}
        {activeTab === 'charts' && <Charts />}

        {/* Pain Points tab */}
        {activeTab === 'painpoints' && <PainPoints />}

        {/* Market Map tab */}
        {activeTab === 'marketmap' && <MarketMap />}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-[var(--accent)] text-[var(--accent)]'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

function SectionLabel({ text }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{text}</p>
  );
}
