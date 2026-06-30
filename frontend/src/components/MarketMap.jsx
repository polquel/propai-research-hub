// Market map: a grid showing company counts and avg ratings by city × company type.
// Rows = company type, columns = top 10 cities.
// Color = avg rating (red = low = market gap = opportunity, green = high = healthy market).
// Click any cell to see the company list inside it.

import { useState, useEffect } from 'react';
import { getMarketMap } from '../services/api';

// Human-readable labels for the internal type strings
const TYPE_LABELS = {
  property_manager: 'Property Managers',
  real_estate:      'Real Estate Agencies',
  admin_agency:     'Admin Agencies',
};

// Background color based on avg rating — low ratings = red = market gap = opportunity for us
function ratingBg(avgRating) {
  if (!avgRating) return 'bg-gray-50 text-gray-300';
  if (avgRating < 3.0) return 'bg-red-50   text-red-700';
  if (avgRating < 3.8) return 'bg-orange-50 text-orange-700';
  if (avgRating < 4.3) return 'bg-yellow-50 text-yellow-700';
  return 'bg-green-50 text-green-700';
}

// Small star dot to visualize the rating
function RatingDot({ rating }) {
  if (!rating) return null;
  const color =
    rating < 3.0 ? 'bg-red-400'    :
    rating < 3.8 ? 'bg-orange-400' :
    rating < 4.3 ? 'bg-yellow-400' :
                   'bg-green-400';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} mr-1`} />;
}

export default function MarketMap() {
  const [data, setData]         = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { city, type, cell }

  useEffect(() => {
    getMarketMap().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const { cities, types, cells } = data;

  function handleCellClick(city, type) {
    const key  = `${city}|${type}`;
    const cell = cells[key];
    if (!cell) return;
    // Toggle: click the same cell again to close
    if (selected?.city === city && selected?.type === type) {
      setSelected(null);
    } else {
      setSelected({ city, type, cell });
    }
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 text-xs text-gray-500">
        <span className="font-semibold text-gray-400 uppercase tracking-wide">Avg rating:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> &lt; 3.0 — poor (market gap)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 inline-block" /> 3.0 – 3.8</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 inline-block" /> 3.8 – 4.3</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 inline-block" /> &gt; 4.3 — healthy</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> no data</span>
      </div>

      {/* Scrollable table wrapper — cities may overflow on small screens */}
      <div className="overflow-x-auto rounded-xl shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b" style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-color)' }}>
              {/* Top-left corner cell */}
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide w-44 sticky left-0 z-10" style={{ color: 'var(--text-subtle)', background: 'var(--surface-subtle)' }}>
                Type \ City
              </th>
              {cities.map((city) => (
                <th key={city} className="px-3 py-3 text-xs font-semibold whitespace-nowrap text-center min-w-[100px]" style={{ color: 'var(--text-muted)' }}>
                  {city}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((type, rowIdx) => (
              <tr key={type} style={{ background: rowIdx % 2 === 0 ? 'var(--surface)' : 'var(--surface-subtle)' }}>
                {/* Row label — sticky so it stays visible when scrolling horizontally */}
                <td className="px-4 py-3 text-xs font-semibold sticky left-0 z-10 border-r" style={{ color: 'var(--text-muted)', background: 'inherit', borderColor: 'var(--border-color)' }}>
                  {TYPE_LABELS[type]}
                </td>
                {cities.map((city) => {
                  const key  = `${city}|${type}`;
                  const cell = cells[key];
                  const isActive = selected?.city === city && selected?.type === type;

                  return (
                    <td key={city} className="px-2 py-2 text-center">
                      {cell ? (
                        <button
                          onClick={() => handleCellClick(city, type)}
                          className={`w-full rounded-lg px-2 py-2 transition-all cursor-pointer border ${
                            isActive
                              ? 'border-[var(--accent)] ring-2 ring-[var(--accent)] ring-opacity-30'
                              : 'border-transparent hover:border-gray-200'
                          } ${ratingBg(cell.avgRating)}`}
                        >
                          <div className="font-bold text-base leading-none">{cell.count}</div>
                          <div className="text-xs mt-1 flex items-center justify-center">
                            <RatingDot rating={cell.avgRating} />
                            {cell.avgRating}★
                          </div>
                        </button>
                      ) : (
                        <span className="text-gray-200 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Company list panel — shown below the grid when a cell is selected */}
      {selected && (
        <div className="mt-4 rounded-xl p-5 shadow-sm border" style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                {TYPE_LABELS[selected.type]} in {selected.city}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                {selected.cell.count} companies · avg {selected.cell.avgRating}★
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {selected.cell.companies.map((c) => (
              <a
                key={c.id}
                href={c.website || '#'}
                target={c.website ? '_blank' : undefined}
                rel="noreferrer"
                className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                  c.website ? 'hover:border-[var(--accent)] cursor-pointer' : 'cursor-default'
                } ${ratingBg(c.rating)} border-current border-opacity-20`}
              >
                <div className="font-medium truncate">{c.name}</div>
                {c.rating && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <RatingDot rating={c.rating} />
                    {c.rating}★
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
