// Form for adding a new property management company manually.

import { useState } from 'react';
import { createCompany } from '../services/api';

// Shared input style — defined once so all fields look identical
const inputClass =
  'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white';

export default function CompanyForm({ onCompanyAdded }) {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [services, setServices] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const newCompany = await createCompany({ name, website, country, services, employeeCount, notes });
    onCompanyAdded(newCompany);

    setName(''); setWebsite(''); setCountry('');
    setServices(''); setEmployeeCount(''); setNotes('');
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Add Company</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Company name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="url"
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Country (e.g. Spain)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Services (e.g. billing, maintenance)"
          value={services}
          onChange={(e) => setServices(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Employee count (e.g. 50–200)"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(e.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="Notes — pain points, AI opportunities..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--accent)] text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Save Company'}
        </button>
      </div>
    </form>
  );
}
