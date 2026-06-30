// All API calls to the backend — one file for all communication.

const COMPANIES_URL = '/api/companies';
const OPPORTUNITIES_URL = '/api/opportunities';

// --- Companies ---

// filters: { search, city, type, minRating, sort }
export async function getAllCompanies(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search)    params.set('search', filters.search);
  if (filters.city)      params.set('city', filters.city);
  if (filters.type)      params.set('type', filters.type);
  if (filters.minRating) params.set('minRating', filters.minRating);
  if (filters.sort)      params.set('sort', filters.sort);
  const response = await fetch(`${COMPANIES_URL}?${params}`);
  return response.json();
}

export async function getCities() {
  const response = await fetch(`${COMPANIES_URL}/meta/cities`);
  return response.json();
}

export async function createCompany(data) {
  const response = await fetch(COMPANIES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCompany(id) {
  await fetch(`${COMPANIES_URL}/${id}`, { method: 'DELETE' });
}

// --- AI Opportunities ---

export async function getAllOpportunities() {
  const response = await fetch(OPPORTUNITIES_URL);
  return response.json();
}

export async function createOpportunity(data) {
  const response = await fetch(OPPORTUNITIES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteOpportunity(id) {
  await fetch(`${OPPORTUNITIES_URL}/${id}`, { method: 'DELETE' });
}

// --- Stats (for the charts dashboard) ---

export async function getStats() {
  const response = await fetch('/api/stats');
  return response.json();
}

export async function getPainPoints() {
  const response = await fetch('/api/stats/pain-points');
  return response.json();
}
