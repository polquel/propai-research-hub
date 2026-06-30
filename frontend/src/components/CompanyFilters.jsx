// Filter and sort controls for the company list.
// Calls onChange whenever any filter changes — parent re-fetches.

export default function CompanyFilters({ filters, onChange, cities, total }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const selectClass =
    'border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full';

  return (
    <div
      className="rounded-xl p-5 shadow-sm flex flex-col gap-3 border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text)' }}>Filter</h2>
        <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{total} results</span>
      </div>

      <input
        type="text"
        placeholder="Search by name..."
        value={filters.search || ''}
        onChange={(e) => set('search', e.target.value)}
        className={selectClass}
        style={{ borderColor: 'var(--border-color)' }}
      />

      <select
        value={filters.city || ''}
        onChange={(e) => set('city', e.target.value)}
        className={selectClass}
        style={{ borderColor: 'var(--border-color)' }}
      >
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c.city} value={c.city}>{c.city} ({c.count})</option>
        ))}
      </select>

      <select
        value={filters.type || ''}
        onChange={(e) => set('type', e.target.value)}
        className={selectClass}
        style={{ borderColor: 'var(--border-color)' }}
      >
        <option value="">All types</option>
        <option value="property_manager">Property Managers</option>
        <option value="real_estate">Real Estate Agencies</option>
        <option value="admin_agency">Admin Agencies</option>
      </select>

      <select
        value={filters.minRating || ''}
        onChange={(e) => set('minRating', e.target.value)}
        className={selectClass}
        style={{ borderColor: 'var(--border-color)' }}
      >
        <option value="">Any rating</option>
        <option value="4">★ 4+ (good)</option>
        <option value="3">★ 3+ (average)</option>
        <option value="0.1">★ has rating</option>
      </select>

      <select
        value={filters.sort || ''}
        onChange={(e) => set('sort', e.target.value)}
        className={selectClass}
        style={{ borderColor: 'var(--border-color)' }}
      >
        <option value="">Sort: newest first</option>
        <option value="rating_asc">Sort: worst rated (pain points)</option>
        <option value="rating_desc">Sort: best rated</option>
        <option value="reviews">Sort: most reviewed</option>
        <option value="name">Sort: A → Z</option>
      </select>

      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => onChange({})}
          className="text-xs transition-colors text-left hover:text-red-400"
          style={{ color: 'var(--text-subtle)' }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
