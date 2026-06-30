// This file maps URL patterns to controller functions.
// It doesn't contain any logic — just "this URL → call that function".

const express = require('express');
const router = express.Router(); // Router is like a mini Express app for grouping routes

const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');

router.get('/', getAllArticles);         // GET    /api/articles
router.get('/:id', getArticleById);     // GET    /api/articles/:id
router.post('/', createArticle);        // POST   /api/articles
router.put('/:id', updateArticle);      // PUT    /api/articles/:id
router.delete('/:id', deleteArticle);   // DELETE /api/articles/:id

module.exports = router;
