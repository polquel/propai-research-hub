// Displays logged AI feature opportunities, sorted by viability score.

import { deleteOpportunity } from '../services/api';

// Maps viability number to a colour and label
const VIABILITY_LABELS = {
  5: { label: 'Proven', color: 'bg-green-100 text-green-700' },
  4: { label: 'Strong', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Likely', color: 'bg-yellow-100 text-yellow-700' },
  2: { label: 'Uncertain', color: 'bg-orange-100 text-orange-700' },
  1: { label: 'Speculative', color: 'bg-red-100 text-red-600' },
};

export default function OpportunityList({ opportunities, onDelete }) {
  if (opportunities.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-12">
        No opportunities logged yet. Add your first feature idea above.
      </p>
    );
  }

  async function handleDelete(id) {
    await deleteOpportunity(id);
    onDelete(id);
  }

  return (
    <ul className="flex flex-col gap-4">
      {opportunities.map((opp) => {
        const viabilityInfo = VIABILITY_LABELS[opp.viability] || null;
        return (
          <li key={opp.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">

                <span className="font-medium text-gray-800">{opp.title}</span>

                <div className="flex gap-2 flex-wrap text-xs">
                  {viabilityInfo && (
                    <span className={`rounded px-2 py-0.5 font-medium ${viabilityInfo.color}`}>
                      {opp.viability}/5 — {viabilityInfo.label}
                    </span>
                  )}
                  {opp.targetArea && (
                    <span className="bg-gray-100 text-gray-500 rounded px-2 py-0.5">{opp.targetArea}</span>
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
                className="text-red-400 hover:text-red-600 text-xs shrink-0 transition-colors"
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
