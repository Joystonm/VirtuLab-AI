const express = require('express');
const router = express.Router();

router.get('/history', (req, res) => {
  res.json({ message: 'Experiment history endpoint' });
});

router.post('/save', (req, res) => {
  res.json({ message: 'Save experiment endpoint' });
});

module.exports = router;
