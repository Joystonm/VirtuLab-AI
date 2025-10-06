const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./api/userRoutes');
const experimentRoutes = require('./api/experimentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/experiments', experimentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'VirtuLab Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 VirtuLab Backend running on port ${PORT}`);
});
