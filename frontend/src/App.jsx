// Root component — manages state for both articles and companies, with tab navigation.

import { useState, useEffect } from 'react';
import { getAllArticles, getAllCompanies } from './services/api';
import ArticleForm from './components/ArticleForm';
import ArticleList from './components/ArticleList';
import CompanyForm from './components/CompanyForm';
import CompanyList from './components/CompanyList';

export default function App() {
  const [activeTab, setActiveTab] = useState('companies'); // 'articles' or 'companies'

  const [articles, setArticles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch both lists on first load
  useEffect(() => {
    async function fetchAll() {
      const [articleData, companyData] = await Promise.all([
        getAllArticles(),
        getAllCompanies(),
      ]);
      setArticles(articleData);
      setCompanies(companyData);
      setIsLoading(false);
    }
    fetchAll();
  }, []);

  function handleArticleAdded(newArticle) { setArticles([newArticle, ...articles]); }
  function handleArticleDeleted(id) { setArticles(articles.filter((a) => a.id !== id)); }

  function handleCompanyAdded(newCompany) { setCompanies([newCompany, ...companies]); }
  function handleCompanyDeleted(id) { setCompanies(companies.filter((c) => c.id !== id)); }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">PropAI Research Hub</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track companies and research about AI in property management
          </p>
        </div>

        {/* Tab navigation */}
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
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'articles'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Research ({articles.length})
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

            {activeTab === 'articles' && (
              <>
                <div className="mb-8">
                  <ArticleForm onArticleAdded={handleArticleAdded} />
                </div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Saved Research ({articles.length})
                </h2>
                <ArticleList articles={articles} onDelete={handleArticleDeleted} />
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
