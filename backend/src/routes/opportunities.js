const express = require('express');
const router = express.Router();

const {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');

router.get('/', getAllOpportunities);
router.get('/:id', getOpportunityById);
router.post('/', createOpportunity);
router.put('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);

module.exports = router;
