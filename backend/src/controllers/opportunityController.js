// Logic for AI Opportunity endpoints — feature ideas for our future HOA product.

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function getAllOpportunities(req, res) {
  const opportunities = await prisma.aIOpportunity.findMany({
    orderBy: { viability: 'desc' }, // Show highest viability first
  });
  res.json(opportunities);
}

async function getOpportunityById(req, res) {
  const { id } = req.params;
  const opportunity = await prisma.aIOpportunity.findUnique({ where: { id } });
  if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
  res.json(opportunity);
}

async function createOpportunity(req, res) {
  const { title, description, targetArea, viability, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newOpportunity = await prisma.aIOpportunity.create({
    data: {
      title,
      description,
      targetArea,
      viability: viability ? parseInt(viability) : null, // Store as number
      notes,
    },
  });
  res.status(201).json(newOpportunity);
}

async function updateOpportunity(req, res) {
  const { id } = req.params;
  const { title, description, targetArea, viability, notes } = req.body;

  const existing = await prisma.aIOpportunity.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Opportunity not found' });

  const updated = await prisma.aIOpportunity.update({
    where: { id },
    data: {
      title,
      description,
      targetArea,
      viability: viability ? parseInt(viability) : null,
      notes,
    },
  });
  res.json(updated);
}

async function deleteOpportunity(req, res) {
  const { id } = req.params;
  const existing = await prisma.aIOpportunity.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Opportunity not found' });

  await prisma.aIOpportunity.delete({ where: { id } });
  res.status(204).send();
}

module.exports = { getAllOpportunities, getOpportunityById, createOpportunity, updateOpportunity, deleteOpportunity };
