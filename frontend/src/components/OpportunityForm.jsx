// Form for logging an AI feature idea for our future HOA product.

import { useState } from 'react';
import { createOpportunity } from '../services/api';

const inputClass =
  'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white';

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
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Add AI Opportunity</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Feature title * (e.g. Chatbot for resident queries)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
        <textarea
          placeholder="Description — what does this feature do and how?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
        <input
          type="text"
          placeholder="Target area (e.g. billing, communication)"
          value={targetArea}
          onChange={(e) => setTargetArea(e.target.value)}
          className={inputClass}
        />
        {/* Viability score 1–5: how realistic is this to build and sell? */}
        <select
          value={viability}
          onChange={(e) => setViability(e.target.value)}
          className={inputClass}
        >
          <option value="">Viability score...</option>
          <option value="5">5 — Proven demand</option>
          <option value="4">4 — Strong signal</option>
          <option value="3">3 — Likely viable</option>
          <option value="2">2 — Uncertain</option>
          <option value="1">1 — Speculative</option>
        </select>
        <textarea
          placeholder="Notes — which companies need this? Competitors? Risks?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--accent)] text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Save Opportunity'}
        </button>
      </div>
    </form>
  );
}
