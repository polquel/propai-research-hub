// Displays the list of tracked property management companies.

import { deleteCompany } from '../services/api';

export default function CompanyList({ companies, onDelete }) {
  if (companies.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-12">
        No companies tracked yet. Add your first one above.
      </p>
    );
  }

  async function handleDelete(id) {
    await deleteCompany(id);
    onDelete(id);
  }

  return (
    <ul className="flex flex-col gap-4">
      {companies.map((company) => (
        <li key={company.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">

              {/* Company name + website */}
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer"
                  className="text-indigo-600 font-medium hover:underline">
                  {company.name}
                </a>
              ) : (
                <span className="font-medium text-gray-800">{company.name}</span>
              )}

              {/* Country + employee count badges */}
              <div className="flex gap-2 flex-wrap text-xs text-gray-400">
                {company.country && (
                  <span className="bg-blue-50 text-blue-600 rounded px-2 py-0.5">{company.country}</span>
                )}
                {company.employeeCount && (
                  <span className="bg-gray-100 rounded px-2 py-0.5">{company.employeeCount} employees</span>
                )}
                <span>{new Date(company.addedAt).toLocaleDateString()}</span>
              </div>

              {/* Services */}
              {company.services && (
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Services:</span> {company.services}
                </p>
              )}

              {/* Notes */}
              {company.notes && (
                <p className="text-sm text-gray-600 mt-1">{company.notes}</p>
              )}
            </div>

            <button
              onClick={() => handleDelete(company.id)}
              className="text-red-400 hover:text-red-600 text-xs shrink-0 transition-colors"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
