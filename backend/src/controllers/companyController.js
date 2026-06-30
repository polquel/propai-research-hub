// Logic for company endpoints — includes local CRUD and Apollo import search.

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// Returns a list of cities with company counts, sorted alphabetically.
async function getCities(req, res) {
  try {
    const rows = await prisma.company.groupBy({
      by: ['city'],
      where: { city: { not: null } },
      _count: { city: true },
      orderBy: { city: 'asc' },
    });
    res.json(rows.map((r) => ({ city: r.city, count: r._count.city })));
  } catch (err) {
    console.error('getCities error:', err);
    res.status(500).json({ error: 'Failed to load cities', detail: err.message });
  }
}

async function getAllCompanies(req, res) {
  const { search, city, type, minRating, sort } = req.query;

  // Build filters dynamically — only apply what was sent
  const where = {};
  if (search)    where.name = { contains: search };
  if (city)      where.city = city;
  if (type)      where.companyType = type;
  if (minRating) where.rating = { gte: parseFloat(minRating) };

  // Sort options: by rating (worst first = pain points), name, or date added
  const orderBy =
    sort === 'rating_asc'  ? { rating: 'asc' }  :
    sort === 'rating_desc' ? { rating: 'desc' } :
    sort === 'name'        ? { name: 'asc' }    :
    sort === 'reviews'     ? { reviewCount: 'desc' } :
    { addedAt: 'desc' };

  const companies = await prisma.company.findMany({ where, orderBy });
  res.json(companies);
}

async function getCompanyById(req, res) {
  const { id } = req.params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
}

async function createCompany(req, res) {
  const { name, website, country, services, employeeCount, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newCompany = await prisma.company.create({
    data: { name, website, country, services, employeeCount, notes },
  });
  res.status(201).json(newCompany);
}

async function updateCompany(req, res) {
  const { id } = req.params;
  const { name, website, country, services, employeeCount, notes } = req.body;

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Company not found' });

  const updated = await prisma.company.update({
    where: { id },
    data: { name, website, country, services, employeeCount, notes },
  });
  res.json(updated);
}

async function deleteCompany(req, res) {
  const { id } = req.params;
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Company not found' });

  await prisma.company.delete({ where: { id } });
  res.status(204).send();
}

// Search Apollo.io for property management companies and return candidates.
// The results are NOT saved yet — the user picks which ones to import.
async function searchApollo(req, res) {
  const { query = 'property management', country } = req.body;
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'APOLLO_API_KEY not set in .env' });
  }

  // Build the search filters for Apollo
  // Filter by industry instead of keyword — more accurate for niche sectors
  const body = {
    organization_industries: [query],
    per_page: 20,
    page: 1,
  };

  if (country) {
    body.organization_locations = [country];
  }

  const apolloResponse = await fetch('https://api.apollo.io/api/v1/organizations/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!apolloResponse.ok) {
    const errorText = await apolloResponse.text();
    return res.status(502).json({ error: 'Apollo API error', detail: errorText });
  }

  const data = await apolloResponse.json();
  const organizations = data.organizations || [];

  // Map Apollo's fields to our Company shape
  const results = organizations.map((org) => ({
    name: org.name,
    website: org.website_url || org.primary_domain,
    country: org.country,
    services: org.industry,
    employeeCount: org.estimated_num_employees
      ? String(org.estimated_num_employees)
      : null,
    notes: org.short_description || null,
  }));

  res.json(results);
}

module.exports = {
  getCities,
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  searchApollo,
};
