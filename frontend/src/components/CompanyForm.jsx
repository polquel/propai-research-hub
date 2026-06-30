// Form for adding a new property management company.

import { useState } from 'react';
import { createCompany } from '../services/api';

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
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Company</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Company name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="Website (optional)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1"
          />
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-32"
          />
        </div>
        <input
          type="text"
          placeholder="Services (e.g. billing, maintenance, resident portal)"
          value={services}
          onChange={(e) => setServices(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Employee count (e.g. 50-200)"
          value={employeeCount}
          onChange={(e) => setEmployeeCount(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <textarea
          placeholder="Notes (pain points, AI opportunities observed...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Company'}
        </button>
      </div>
    </form>
  );
}
