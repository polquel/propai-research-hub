// Displays logged AI feature opportunities, sorted by viability score.

import { deleteOpportunity } from '../services/api';

const VIABILITY_LABELS = {
  5: { label: 'Proven',      color: 'bg-green-100 text-green-700' },
  4: { label: 'Strong',      color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Likely',      color: 'bg-yellow-100 text-yellow-700' },
  2: { label: 'Uncertain',   color: 'bg-orange-100 text-orange-700' },
  1: { label: 'Speculative', color: 'bg-red-100 text-red-600' },
};

export default function OpportunityList({ opportunities, onDelete }) {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--text-subtle)' }}>
        <p className="text-3xl mb-3">💡</p>
        <p className="text-sm">No opportunities logged yet.</p>
        <p className="text-xs mt-1">Add your first feature idea using the form.</p>
      </div>
    );
  }

  async function handleDelete(id) {
    await deleteOpportunity(id);
    onDelete(id);
  }

  return (
    <ul className="flex flex-col gap-3">
      {opportunities.map((opp) => {
        const viabilityInfo = VIABILITY_LABELS[opp.viability] || null;
        return (
          <li
            key={opp.id}
            className="border border-l-4 border-l-[var(--accent)] rounded-xl p-4 sm:p-5 shadow-sm"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{opp.title}</span>

                <div className="flex gap-2 flex-wrap text-xs">
                  {viabilityInfo && (
                    <span className={`rounded-full px-2 py-0.5 font-medium ${viabilityInfo.color}`}>
                      {opp.viability}/5 — {viabilityInfo.label}
                    </span>
                  )}
                  {opp.targetArea && (
                    <span className="bg-[var(--accent-bg)] text-[var(--accent)] rounded-full px-2 py-0.5 font-medium">
                      {opp.targetArea}
                    </span>
                  )}
                </div>

                {opp.description && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{opp.description}</p>
                )}
                {opp.notes && (
                  <p className="text-xs italic" style={{ color: 'var(--text-subtle)' }}>{opp.notes}</p>
                )}
              </div>

              <button
                onClick={() => handleDelete(opp.id)}
                className="text-xs shrink-0 transition-colors hover:text-red-400"
                style={{ color: 'var(--text-subtle)' }}
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
