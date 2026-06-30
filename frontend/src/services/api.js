// All API calls to the backend — one file for all communication.

const COMPANIES_URL = '/api/companies';
const OPPORTUNITIES_URL = '/api/opportunities';

// --- Companies ---

export async function getAllCompanies() {
  const response = await fetch(COMPANIES_URL);
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
