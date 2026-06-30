// Form for logging an AI feature idea for our future HOA product.

import { useState } from 'react';
import { createOpportunity } from '../services/api';

export default function OpportunityForm({ onOpportunityAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetArea, setTargetArea] = useState('');
  const [viability, setViability] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const newOpportunity = await createOpportunity({ title, description, targetArea, viability, notes });
    onOpportunityAdded(newOpportunity);

    setTitle(''); setDescription(''); setTargetArea(''); setViability(''); setNotes('');
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add AI Opportunity</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Feature idea title * (e.g. Chatbot for resident queries)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <textarea
          placeholder="Description — what does this feature do and how?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Target area (e.g. billing, communication)"
            value={targetArea}
            onChange={(e) => setTargetArea(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
          />
          {/* Viability score 1-5 — how realistic is this to build and sell? */}
          <select
            value={viability}
            onChange={(e) => setViability(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-40"
          >
            <option value="">Viability...</option>
            <option value="5">5 — Proven demand</option>
            <option value="4">4 — Strong signal</option>
            <option value="3">3 — Likely viable</option>
            <option value="2">2 — Uncertain</option>
            <option value="1">1 — Speculative</option>
          </select>
        </div>
        <textarea
          placeholder="Notes — which companies need this? Any competitors? Risks?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Opportunity'}
        </button>
      </div>
    </form>
  );
}
