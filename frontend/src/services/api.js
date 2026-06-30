// This file contains all the functions that talk to the backend API.
// Components never call fetch() directly — they use these functions instead.

const BASE_URL = '/api/articles'; // Vite proxy forwards this to http://localhost:3001

export async function getAllArticles() {
  const response = await fetch(BASE_URL);
  return response.json();
}

export async function createArticle(articleData) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // Tell the server we're sending JSON
    body: JSON.stringify(articleData),                // Convert JS object → JSON string
  });
  return response.json();
}

export async function deleteArticle(id) {
  await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
}
