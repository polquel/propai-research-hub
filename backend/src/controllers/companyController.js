// Logic for each company API endpoint — same pattern as articleController.js

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function getAllCompanies(req, res) {
  const companies = await prisma.company.findMany({
    orderBy: { addedAt: 'desc' },
  });
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

module.exports = { getAllCompanies, getCompanyById, createCompany, updateCompany, deleteCompany };
