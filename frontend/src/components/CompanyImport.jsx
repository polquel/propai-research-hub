// Searches Apollo.io for property management companies and lets you import them.

import { useState } from 'react';
import { createCompany } from '../services/api';

async function searchApollo(query, country) {
  const response = await fetch('/api/companies/search-apollo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, country }),
  });
  return response.json();
}

export default function CompanyImport({ onCompanyAdded }) {
  const [query, setQuery] = useState('property management');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importedIds, setImportedIds] = useState(new Set()); // Track which results were imported
  const [error, setError] = useState(null);

  async function handleSearch(event) {
    event.preventDefault();
    setIsSearching(true);
    setError(null);
    setResults([]);
    setImportedIds(new Set());

    const data = await searchApollo(query, country);

    if (data.error) {
      setError(data.error);
    } else {
      setResults(data);
    }
    setIsSearching(false);
  }

  async function handleImport(company, index) {
    const saved = await createCompany(company);
    onCompanyAdded(saved);
    // Mark this result as imported so the button changes
    setImportedIds((prev) => new Set([...prev, index]));
  }

  return (
    <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Import from Apollo</h2>
      <p className="text-xs text-gray-400 mb-4">Search a real company database and import results directly</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search query..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country (optional)"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {results.map((company, index) => {
            const alreadyImported = importedIds.has(index);
            return (
              <li key={index} className="flex items-start justify-between gap-3 border border-gray-100 rounded-lg p-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-sm text-gray-800">{company.name}</span>
                  <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
                    {company.country && <span>{company.country}</span>}
                    {company.employeeCount && <span>{company.employeeCount} employees</span>}
                    {company.services && <span className="truncate max-w-xs">{company.services}</span>}
                  </div>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer"
                      className="text-xs text-indigo-400 hover:underline truncate">
                      {company.website}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleImport(company, index)}
                  disabled={alreadyImported}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors ${
                    alreadyImported
                      ? 'bg-green-100 text-green-600 cursor-default'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {alreadyImported ? 'Imported ✓' : 'Import'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!isSearching && results.length === 0 && !error && (
        <p className="text-gray-300 text-xs text-center py-4">Results will appear here</p>
      )}
    </div>
  );
}
