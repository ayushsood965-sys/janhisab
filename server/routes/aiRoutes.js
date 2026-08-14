const express = require('express');
const router = express.Router();
const { generateFiveLineIssueSummary, runSachBolFactCheck, detectNlpSpamClustering } = require('../services/aiIntelligenceService');

// @route POST /api/ai/summarize-issue
// @desc Generate 5-Line AI Issue Summary
router.post('/summarize-issue', (req, res) => {
  const { title, content, comments = [] } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const summary = generateFiveLineIssueSummary(title, content, comments);
  res.json({ success: true, summary });
});

// @route POST /api/ai/sach-bol-check
// @desc Run "Sach Bol" Fact Checker query
router.post('/sach-bol-check', (req, res) => {
  const { claimText, entityName } = req.body;
  if (!claimText) {
    return res.status(400).json({ success: false, message: 'Claim text is required' });
  }

  const factCheckResult = runSachBolFactCheck(claimText, entityName);
  res.json({ success: true, result: factCheckResult });
});

// @route POST /api/ai/spam-check
// @desc Run NLP Spam Clustering Detection
router.post('/spam-check', (req, res) => {
  const { comments = [] } = req.body;
  const analysis = detectNlpSpamClustering(comments);
  res.json({ success: true, analysis });
});

module.exports = router;
