// Root component — two tabs: Companies (market map) and AI Opportunities (product ideas).

import { useState, useEffect } from 'react';
import { getAllCompanies, getAllOpportunities } from './services/api';
import CompanyForm from './components/CompanyForm';
import CompanyList from './components/CompanyList';
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
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">PropAI Research Hub</h1>
          <p className="text-gray-500 text-sm mt-1">
            Market intelligence for building an AI product for HOAs
          </p>
        </div>

        <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'companies'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'opportunities'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Opportunities ({opportunities.length})
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-12">Loading...</p>
        ) : (
          <>
            {activeTab === 'companies' && (
              <>
                <div className="mb-8">
                  <CompanyForm onCompanyAdded={handleCompanyAdded} />
                </div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Tracked Companies ({companies.length})
                </h2>
                <CompanyList companies={companies} onDelete={handleCompanyDeleted} />
              </>
            )}

            {activeTab === 'opportunities' && (
              <>
                <div className="mb-8">
                  <OpportunityForm onOpportunityAdded={handleOpportunityAdded} />
                </div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Feature Ideas ({opportunities.length}) — sorted by viability
                </h2>
                <OpportunityList opportunities={opportunities} onDelete={handleOpportunityDeleted} />
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
