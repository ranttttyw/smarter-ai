require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compareRoute = require('./routes/compare');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', compareRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Starry AI backend is running' });
});

// Fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Starry server running on http://localhost:${PORT}`);
});
