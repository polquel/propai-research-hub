// Maps URL patterns to company controller functions.

const express = require('express');
const router = express.Router();

const {
  getCities,
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  searchApollo,
} = require('../controllers/companyController');

router.post('/search-apollo', searchApollo);
router.get('/meta/cities', getCities);
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

module.exports = router;
