// Searches Apollo.io for property management companies and lets you import them.

import { useState } from 'react';
import { createCompany } from '../services/api';

const inputClass =
  'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white';

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
  const [importedIds, setImportedIds] = useState(new Set());
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
    setImportedIds((prev) => new Set([...prev, index]));
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">Import from Apollo</h2>
      <p className="text-xs text-gray-400 mb-4">Search a real company database and import directly</p>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search query..."
          className={inputClass}
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country (optional)"
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[var(--accent)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      {results.length > 0 && (
        <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {results.map((company, index) => {
            const alreadyImported = importedIds.has(index);
            return (
              <li key={index} className="flex items-start justify-between gap-3 border border-gray-100 rounded-lg p-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-sm text-gray-800">{company.name}</span>
                  <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
                    {company.country && <span>{company.country}</span>}
                    {company.employeeCount && <span>{company.employeeCount} employees</span>}
                    {company.services && <span className="truncate max-w-[160px]">{company.services}</span>}
                  </div>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer"
                      className="text-xs text-[var(--accent)] hover:underline truncate">
                      {company.website}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleImport(company, index)}
                  disabled={alreadyImported}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors ${
                    alreadyImported
                      ? 'bg-green-50 text-green-600 cursor-default'
                      : 'bg-[var(--accent-bg)] text-[var(--accent)] hover:opacity-80'
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
        <p className="text-gray-300 text-xs text-center py-3">Results will appear here</p>
      )}
    </div>
  );
}
