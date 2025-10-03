const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

module.exports = router;
