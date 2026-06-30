// This is the entry point of the backend server.
// It creates an Express app, registers routes, and starts listening for requests.

const express = require('express'); // Import the Express library

const app = express(); // Create the server instance
const PORT = 3001;    // The port number the server will listen on

app.use(express.json()); // Tell Express to automatically parse JSON request bodies

// Health check route — used to confirm the server is running
// Try it: GET http://localhost:3001/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start the server and begin listening for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
