// Root component — two tabs: Companies (market map) and AI Opportunities (product ideas).

import { useState, useEffect } from 'react';
import { getAllCompanies, getAllOpportunities } from './services/api';
import CompanyForm from './components/CompanyForm';
import CompanyList from './components/CompanyList';
import CompanyImport from './components/CompanyImport';
import OpportunityForm from './components/OpportunityForm';
import OpportunityList from './components/OpportunityList';

export default function App() {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [companyData, opportunityData] = await Promise.all([
        getAllCompanies(),
        getAllOpportunities(),
      ]);
      setCompanies(companyData);
      setOpportunities(opportunityData);
      setIsLoading(false);
    }
    fetchAll();
  }, []);

  function handleCompanyAdded(c) { setCompanies([c, ...companies]); }
  function handleCompanyDeleted(id) { setCompanies(companies.filter((c) => c.id !== id)); }

  function handleOpportunityAdded(o) { setOpportunities([o, ...opportunities]); }
  function handleOpportunityDeleted(id) { setOpportunities(opportunities.filter((o) => o.id !== id)); }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Purple accent bar at the very top */}
      <div className="h-1 bg-[var(--accent)]" />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              PropAI Research Hub
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Market intelligence for building an AI product for HOAs
            </p>
          </div>

          {/* Live count badges in the top-right corner */}
          {!isLoading && (
            <div className="flex gap-2 text-xs font-medium">
              <span className="bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full px-3 py-1">
                {companies.length} companies
              </span>
              <span className="bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] rounded-full px-3 py-1">
                {opportunities.length} opportunities
              </span>
            </div>
          )}
        </div>

        {/* ── Tab bar ────────────────────────────────────────── */}
        <div className="flex border-b border-gray-200 mb-8">
          <TabButton
            label={`Companies (${companies.length})`}
            active={activeTab === 'companies'}
            onClick={() => setActiveTab('companies')}
          />
          <TabButton
            label={`AI Opportunities (${opportunities.length})`}
            active={activeTab === 'opportunities'}
            onClick={() => setActiveTab('opportunities')}
          />
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        {isLoading ? (
          // Spinner while data loads
          <div className="flex justify-center items-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'companies' && (
              // Two-column: sidebar (forms) + main (list)
              <div className="flex gap-6 items-start">
                <aside className="w-80 shrink-0 flex flex-col gap-4">
                  <CompanyImport onCompanyAdded={handleCompanyAdded} />
                  <CompanyForm onCompanyAdded={handleCompanyAdded} />
                </aside>
                <main className="flex-1 min-w-0">
                  <SectionLabel text={`Tracked Companies (${companies.length})`} />
                  <CompanyList companies={companies} onDelete={handleCompanyDeleted} />
                </main>
              </div>
            )}

            {activeTab === 'opportunities' && (
              // Two-column: sidebar (form) + main (list)
              <div className="flex gap-6 items-start">
                <aside className="w-80 shrink-0">
                  <OpportunityForm onOpportunityAdded={handleOpportunityAdded} />
                </aside>
                <main className="flex-1 min-w-0">
                  <SectionLabel text={`Feature Ideas (${opportunities.length}) — sorted by viability`} />
                  <OpportunityList opportunities={opportunities} onDelete={handleOpportunityDeleted} />
                </main>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Small helper components ──────────────────────────────

// A single tab button — purple underline when active
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

// The small uppercase label above a list
function SectionLabel({ text }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
      {text}
    </p>
  );
}
