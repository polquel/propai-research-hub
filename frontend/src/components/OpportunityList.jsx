// Displays logged AI feature opportunities, sorted by viability score.

import { deleteOpportunity } from '../services/api';

// Maps viability number to a colour label shown as a badge
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
      <div className="text-center py-16 text-gray-400">
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
          // Left purple border for visual consistency with company cards
          <li key={opp.id} className="bg-white border border-gray-200 border-l-4 border-l-[var(--accent)] rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">

                <span className="font-semibold text-gray-800">{opp.title}</span>

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
                  <p className="text-sm text-gray-600">{opp.description}</p>
                )}
                {opp.notes && (
                  <p className="text-xs text-gray-400 italic">{opp.notes}</p>
                )}
              </div>

              <button
                onClick={() => handleDelete(opp.id)}
                className="text-gray-300 hover:text-red-400 text-xs shrink-0 transition-colors"
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
