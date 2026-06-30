// Filter and sort controls for the company list.
// Calls onChange whenever any filter changes — parent re-fetches.

export default function CompanyFilters({ filters, onChange, cities, total }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const selectClass =
    'border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filter</h2>
        <span className="text-xs text-gray-400">{total} results</span>
      </div>

      {/* Search by name */}
      <input
        type="text"
        placeholder="Search by name..."
        value={filters.search || ''}
        onChange={(e) => set('search', e.target.value)}
        className={selectClass}
      />

      {/* City dropdown */}
      <select value={filters.city || ''} onChange={(e) => set('city', e.target.value)} className={selectClass}>
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c.city} value={c.city}>
            {c.city} ({c.count})
          </option>
        ))}
      </select>

      {/* Company type */}
      <select value={filters.type || ''} onChange={(e) => set('type', e.target.value)} className={selectClass}>
        <option value="">All types</option>
        <option value="property_manager">Property Managers</option>
        <option value="real_estate">Real Estate Agencies</option>
        <option value="admin_agency">Admin Agencies</option>
      </select>

      {/* Minimum rating */}
      <select value={filters.minRating || ''} onChange={(e) => set('minRating', e.target.value)} className={selectClass}>
        <option value="">Any rating</option>
        <option value="4">★ 4+ (good)</option>
        <option value="3">★ 3+ (average)</option>
        <option value="0.1">★ has rating</option>
      </select>

      {/* Sort */}
      <select value={filters.sort || ''} onChange={(e) => set('sort', e.target.value)} className={selectClass}>
        <option value="">Sort: newest first</option>
        <option value="rating_asc">Sort: worst rated (pain points)</option>
        <option value="rating_desc">Sort: best rated</option>
        <option value="reviews">Sort: most reviewed</option>
        <option value="name">Sort: A → Z</option>
      </select>

      {/* Clear all filters */}
      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => onChange({})}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors text-left"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
