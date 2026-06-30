// Root component — Companies, AI Opportunities, Charts, Pain Points, and Market Map tabs.

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

  // Dark mode — persisted in localStorage so it survives page refresh
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Mobile: sidebar (filters + forms) is hidden by default on small screens
  const [showSidebar, setShowSidebar] = useState(false);

  // Companies state
  const [companies, setCompanies]               = useState([]);
  const [cities, setCities]                     = useState([]);
  const [filters, setFilters]                   = useState({});
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // Opportunities state
  const [opportunities, setOpportunities] = useState([]);
  const [isLoadingOpp, setIsLoadingOpp]   = useState(true);

  // Fetch companies (called on mount and whenever filters change)
  const fetchCompanies = useCallback(async (activeFilters) => {
    setIsLoadingCompanies(true);
    try {
      const data = await getAllCompanies(activeFilters);
      setCompanies(data);
    } catch {
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    getCities().then(setCities).catch(() => {});
    getAllOpportunities()
      .then((data) => { setOpportunities(data); setIsLoadingOpp(false); })
      .catch(() => setIsLoadingOpp(false));
  }, []);

  useEffect(() => {
    fetchCompanies(filters);
  }, [filters, fetchCompanies]);

  function handleCompanyAdded(c)    { setCompanies((prev) => [c, ...prev]); }
  function handleCompanyDeleted(id) { setCompanies((prev) => prev.filter((c) => c.id !== id)); }
  function handleOpportunityAdded(o)    { setOpportunities((prev) => [o, ...prev]); }
  function handleOpportunityDeleted(id) { setOpportunities((prev) => prev.filter((o) => o.id !== id)); }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-subtle)' }}>
      <div className="h-1 bg-[var(--accent)]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              PropAI Research Hub
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-subtle)' }}>
              Market intelligence for building an AI product for HOAs
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full px-3 py-1 text-xs font-medium">
              {companies.length} companies
            </span>
            <span className="bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full px-3 py-1 text-xs font-medium">
              {opportunities.length} ideas
            </span>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className="text-xs px-3 py-1 rounded-full border transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? '☀ Light' : '☾ Dark'}
            </button>
          </div>
        </div>

        {/* Tab bar — scrollable horizontally on mobile so all 5 tabs fit */}
        <div
          className="flex overflow-x-auto border-b mb-8 scrollbar-none -mx-4 sm:-mx-6 px-4 sm:px-6"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <TabButton label={`Companies (${companies.length})`}    active={activeTab === 'companies'}    onClick={() => setActiveTab('companies')} />
          <TabButton label={`AI Opportunities (${opportunities.length})`} active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} />
          <TabButton label="Charts"      active={activeTab === 'charts'}     onClick={() => setActiveTab('charts')} />
          <TabButton label="Pain Points" active={activeTab === 'painpoints'} onClick={() => setActiveTab('painpoints')} />
          <TabButton label="Market Map"  active={activeTab === 'marketmap'}  onClick={() => setActiveTab('marketmap')} />
        </div>

        {/* ── Companies tab ── */}
        {activeTab === 'companies' && (
          <>
            {/* Mobile sidebar toggle — hidden on md+ where sidebar is always visible */}
            <button
              className="md:hidden mb-4 w-full text-sm rounded-xl px-4 py-2.5 border transition-colors text-left"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--surface)' }}
              onClick={() => setShowSidebar((s) => !s)}
            >
              {showSidebar ? '✕ Hide filters & tools' : '⚙ Filters & tools'}
            </button>

            <div className="flex gap-6 items-start">
              {/* Sidebar: hidden on mobile unless toggle is open; always visible on md+ */}
              <aside className={`w-72 shrink-0 flex-col gap-4 ${showSidebar ? 'flex' : 'hidden'} md:flex`}>
                <CompanyFilters filters={filters} onChange={setFilters} cities={cities} total={companies.length} />
                <CompanyImport onCompanyAdded={handleCompanyAdded} />
                <CompanyForm onCompanyAdded={handleCompanyAdded} />
              </aside>

              {/* Main list */}
              <main className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel text={`${companies.length} companies${Object.values(filters).some(Boolean) ? ' (filtered)' : ''}`} />
                  <button
                    onClick={() => exportCompaniesCSV(companies)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--accent)' }}
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
          </>
        )}

        {/* ── AI Opportunities tab ── */}
        {activeTab === 'opportunities' && (
          <div className="flex gap-6 items-start">
            <aside className="w-72 shrink-0 hidden md:block">
              <OpportunityForm onOpportunityAdded={handleOpportunityAdded} />
            </aside>
            {/* Mobile: form above list */}
            <div className="md:hidden w-full mb-4">
              <OpportunityForm onOpportunityAdded={handleOpportunityAdded} />
            </div>
            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel text={`${opportunities.length} feature ideas — sorted by viability`} />
                <button
                  onClick={() => exportOpportunitiesMD(opportunities)}
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--accent)' }}
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

        {/* ── Charts tab ── */}
        {activeTab === 'charts' && <Charts />}

        {/* ── Pain Points tab ── */}
        {activeTab === 'painpoints' && <PainPoints />}

        {/* ── Market Map tab ── */}
        {activeTab === 'marketmap' && <MarketMap />}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 sm:px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0"
      style={{
        borderBottomColor: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      {label}
    </button>
  );
}

function SectionLabel({ text }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
      {text}
    </p>
  );
}
