// Displays tracked companies with all research fields: rating, type, city, reviews.

import { deleteCompany } from '../services/api';

const TYPE_LABELS = {
  property_manager: { label: 'Property Manager', color: 'bg-[var(--accent-bg)] text-[var(--accent)]' },
  real_estate:      { label: 'Real Estate',       color: 'bg-blue-100 text-blue-700' },
  admin_agency:     { label: 'Admin Agency',       color: 'bg-purple-100 text-purple-700' },
};

function StarRating({ rating }) {
  if (!rating) return null;
  const color = rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-500' : 'text-red-500';
  return (
    <span className={`font-semibold text-sm ${color}`}>
      ★ {rating.toFixed(1)}
    </span>
  );
}

export default function CompanyList({ companies, onDelete }) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-3xl mb-3">🏢</p>
        <p className="text-sm">No companies tracked yet.</p>
        <p className="text-xs mt-1">Add one using the form, or import from Apollo.</p>
      </div>
    );
  }

  async function handleDelete(id) {
    await deleteCompany(id);
    onDelete(id);
  }

  return (
    <ul className="flex flex-col gap-3">
      {companies.map((company) => {
        const typeInfo = TYPE_LABELS[company.companyType] || null;
        let parsedReviews = [];
        try {
          if (company.reviews) parsedReviews = JSON.parse(company.reviews);
        } catch {}

        return (
          // Left purple border is the primary visual identity of each card
          <li key={company.id} className="bg-white border border-gray-200 border-l-4 border-l-[var(--accent)] rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 min-w-0 w-full">

                {/* Name + star rating + review count */}
                <div className="flex items-center gap-2 flex-wrap">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer"
                      className="font-semibold text-[var(--accent)] hover:underline">
                      {company.name}
                    </a>
                  ) : (
                    <span className="font-semibold text-gray-800">{company.name}</span>
                  )}
                  <StarRating rating={company.rating} />
                  {company.reviewCount > 0 && (
                    <span className="text-xs text-gray-400">({company.reviewCount} reviews)</span>
                  )}
                </div>

                {/* Metadata badges */}
                <div className="flex gap-2 flex-wrap text-xs">
                  {typeInfo && (
                    <span className={`rounded-full px-2 py-0.5 font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  )}
                  {company.city && (
                    <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                      {company.city}{company.country ? `, ${company.country}` : ''}
                    </span>
                  )}
                  {company.employeeCount && (
                    <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                      {company.employeeCount} employees
                    </span>
                  )}
                </div>

                {company.services && (
                  <p className="text-xs text-gray-500">{company.services}</p>
                )}

                {company.address && (
                  <p className="text-xs text-gray-400">{company.address}</p>
                )}

                {/* Negative reviews = pain point evidence */}
                {parsedReviews.length > 0 && (
                  <div className="mt-1 border-l-2 border-red-200 pl-3 flex flex-col gap-1">
                    <span className="text-xs font-medium text-red-500">
                      Negative reviews (pain points):
                    </span>
                    {parsedReviews.map((review, i) => (
                      <p key={i} className="text-xs text-gray-500 italic">"{review}"</p>
                    ))}
                  </div>
                )}

                {company.notes && (
                  <p className="text-sm text-gray-600 mt-1">{company.notes}</p>
                )}
              </div>

              <button
                onClick={() => handleDelete(company.id)}
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
