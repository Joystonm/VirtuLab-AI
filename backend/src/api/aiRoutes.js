const express = require('express');
const groqService = require('../services/groqService');
const tavilyService = require('../services/tavilyService');

const router = express.Router();

// Chat endpoint for AI tutor
router.post('/chat', async (req, res) => {
  try {
    const { message, experimentLogs } = req.body;

    // Get quick response from Groq
    const groqResponse = await groqService.getResponse(message, experimentLogs);

    // Get fact-checked information from Tavily (if needed)
    let tavilyData = null;
    if (groqResponse.needsVerification) {
      tavilyData = await tavilyService.searchAndVerify(message);
    }

    res.json({
      response: groqResponse.answer,
      verified: !!tavilyData,
      sources: tavilyData?.sources || []
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Instant feedback endpoint
router.post('/feedback', async (req, res) => {
  try {
    const { action, data } = req.body;

    const feedback = await groqService.getInstantFeedback(action, data);

    res.json({
      message: feedback.message,
      type: feedback.type, // 'success', 'warning', 'error'
      verified: false // Instant feedback doesn't need verification
    });
  } catch (error) {
    console.error('AI Feedback Error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

module.exports = router;
