// Entry point — creates the Express server and registers all routes.

require('dotenv').config();
const express = require('express');
const companyRoutes = require('./routes/companies');
const opportunityRoutes = require('./routes/opportunities');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/companies', companyRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
