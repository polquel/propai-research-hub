// This file contains the logic for each article API endpoint.
// It uses Prisma to read from and write to the SQLite database.

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

// Adapter tells Prisma how to connect to our SQLite file
// Must pass { url: 'file:...' } — the adapter strips the 'file:' prefix internally
const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });

// One shared Prisma instance — creating multiple causes connection issues
const prisma = new PrismaClient({ adapter });

// GET /api/articles — return all articles, newest first
async function getAllArticles(req, res) {
  const articleList = await prisma.article.findMany({
    orderBy: { savedAt: 'desc' }, // newest saved first
  });
  res.json(articleList);
}

// GET /api/articles/:id — return one article by its ID
async function getArticleById(req, res) {
  const { id } = req.params; // :id from the URL becomes req.params.id

  const article = await prisma.article.findUnique({
    where: { id: id },
  });

  if (!article) {
    // 404 = "Not Found" — standard HTTP status code for missing resources
    return res.status(404).json({ error: 'Article not found' });
  }

  res.json(article);
}

// POST /api/articles — create a new article
async function createArticle(req, res) {
  const { title, url, summary, notes, source, publishedAt } = req.body;

  // title is the only required field
  if (!title) {
    // 400 = "Bad Request" — the client sent incomplete data
    return res.status(400).json({ error: 'Title is required' });
  }

  const newArticle = await prisma.article.create({
    data: {
      title,
      url,
      summary,
      notes,
      source,
      // Convert publishedAt string to a Date object if provided
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    },
  });

  // 201 = "Created" — more specific than 200 OK, signals a resource was created
  res.status(201).json(newArticle);
}

// PUT /api/articles/:id — update an existing article
async function updateArticle(req, res) {
  const { id } = req.params;
  const { title, url, summary, notes, source, publishedAt } = req.body;

  // Check the article exists before trying to update it
  const existingArticle = await prisma.article.findUnique({ where: { id } });
  if (!existingArticle) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const updatedArticle = await prisma.article.update({
    where: { id },
    data: {
      title,
      url,
      summary,
      notes,
      source,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    },
  });

  res.json(updatedArticle);
}

// DELETE /api/articles/:id — remove an article
async function deleteArticle(req, res) {
  const { id } = req.params;

  const existingArticle = await prisma.article.findUnique({ where: { id } });
  if (!existingArticle) {
    return res.status(404).json({ error: 'Article not found' });
  }

  await prisma.article.delete({ where: { id } });

  // 204 = "No Content" — success, but nothing to send back
  res.status(204).send();
}

// Export all functions so routes/articles.js can use them
module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
