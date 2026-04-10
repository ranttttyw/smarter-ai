require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compareRoute = require('./routes/compare');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Smarter AI backend is running' });
});

// Routes
app.use('/api', compareRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
