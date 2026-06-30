// Pain point analysis view.
// Shows which complaint themes appear most often across scraped company reviews.
// The goal: understand what HOA residents hate → decide what our product should fix.

import { useState, useEffect } from 'react';
import { getPainPoints } from '../services/api';
import { exportPainPointsMD } from '../services/exportUtils';

// Color the count badge based on how widespread the problem is
function severityColor(count) {
  if (count >= 60) return 'bg-red-100 text-red-700 border-red-200';
  if (count >= 30) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (count >= 10) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

// Width of the horizontal bar relative to the highest count
function barWidth(count, max) {
  return Math.round((count / max) * 100) + '%';
}

export default function PainPoints() {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // which theme is open

  useEffect(() => {
    getPainPoints().then((data) => {
      setThemes(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const maxCount = Math.max(...themes.map((t) => t.count), 1);

  return (
    <div className="max-w-3xl">
      {/* Header row: explanation + export button */}
      <div className="flex items-start justify-between gap-4 mb-6">
      <div className="bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl p-4 flex-1">
        <p className="text-sm text-[var(--accent)] font-medium">Product intelligence</p>
        <p className="text-sm text-gray-600 mt-1">
          Based on {themes.reduce((s, t) => s + t.count, 0)} complaint signals across{' '}
          {Math.max(...themes.map((t) => t.count))}+ companies.
          Each row is a recurring theme found in negative reviews — the count is the number of
          companies where at least one review matches that complaint.
        </p>
      </div>
        <button
          onClick={() => exportPainPointsMD(themes)}
          className="text-xs text-[var(--accent)] hover:underline font-medium shrink-0 mt-1"
        >
          Export Markdown ↓
        </button>
      </div>

      {/* Theme list */}
      <div className="flex flex-col gap-3">
        {themes.map((t, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={t.theme}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Clickable header row */}
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                {/* Rank number */}
                <span className="text-xs font-bold text-gray-300 w-5 shrink-0 mt-0.5">
                  #{i + 1}
                </span>

                {/* Theme name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{t.theme}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${severityColor(t.count)}`}
                    >
                      {t.count} companies
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{t.description}</p>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full"
                      style={{ width: barWidth(t.count, maxCount) }}
                    />
                  </div>
                </div>

                {/* Expand chevron */}
                <span className="text-gray-300 text-xs shrink-0 mt-1">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Expanded: example reviews + affected companies */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  {/* Example reviews */}
                  {t.examples.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Example reviews
                      </p>
                      <div className="flex flex-col gap-2">
                        {t.examples.map((ex, j) => (
                          <div key={j} className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1 font-medium">
                              {ex.company} · {ex.city}
                            </p>
                            <p className="text-sm text-gray-700 italic">"{ex.text}…"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affected companies (first 15) */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Affected companies ({t.companies.length} total)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.companies.slice(0, 15).map((c) => (
                        <span
                          key={c.name + c.city}
                          className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600"
                          title={`${c.rating}⭐ · ${c.city}`}
                        >
                          {c.name}
                        </span>
                      ))}
                      {t.companies.length > 15 && (
                        <span className="text-xs text-gray-400 px-2 py-0.5">
                          +{t.companies.length - 15} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
