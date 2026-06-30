// This is the entry point of the backend server.
// It creates an Express app, registers routes, and starts listening for requests.

require('dotenv').config(); // Load .env variables into process.env (must be first)
const express = require('express'); // Import the Express library
const articleRoutes = require('./routes/articles'); // Import article routes

const app = express(); // Create the server instance
const PORT = 3001;    // The port number the server will listen on

app.use(express.json()); // Tell Express to automatically parse JSON request bodies

// Health check route — used to confirm the server is running
// Try it: GET http://localhost:3001/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mount article routes — all URLs in articles.js will be prefixed with /api/articles
app.use('/api/articles', articleRoutes);

// Start the server and begin listening for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
