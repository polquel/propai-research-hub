// All fetch() calls to the backend — one place for all API communication.

const ARTICLES_URL = '/api/articles';
const COMPANIES_URL = '/api/companies';

// --- Articles ---

export async function getAllArticles() {
  const response = await fetch(ARTICLES_URL);
  return response.json();
}

export async function createArticle(articleData) {
  const response = await fetch(ARTICLES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData),
  });
  return response.json();
}

export async function deleteArticle(id) {
  await fetch(`${ARTICLES_URL}/${id}`, { method: 'DELETE' });
}

// --- Companies ---

export async function getAllCompanies() {
  const response = await fetch(COMPANIES_URL);
  return response.json();
}

export async function createCompany(companyData) {
  const response = await fetch(COMPANIES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(companyData),
  });
  return response.json();
}

export async function deleteCompany(id) {
  await fetch(`${COMPANIES_URL}/${id}`, { method: 'DELETE' });
}
