const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Politician = require('../models/Politician');
const User = require('../models/User');
const CmsConfig = require('../models/CmsConfig');
const { protect } = require('../middleware/authMiddleware');
const { recalculatePoliticianImpactScore } = require('../services/impactScoreEngine');
const { evaluateDivergence } = require('../services/divergenceEngine');

// @route POST /api/ratings
// @desc Submit quadratic multi-dimensional rating for politician
router.post('/', protect, async (req, res) => {
  try {
    const {
      politicianId,
      dimensions, // { infrastructure, accessibility, promiseKeeping, transparency, legislative, social, economic }
      votesCount = 1, // Desired vote count: 1 to 5
      evidenceTier = 3, // 1 (3x), 2 (1.5x), 3 (1x)
      evidenceUrl,
      comments,
    } = req.body;

    if (!politicianId || !dimensions) {
      return res.status(400).json({ success: false, message: 'Politician ID and dimensions are required' });
    }

    const politician = await Politician.findById(politicianId);
    if (!politician) {
      return res.status(404).json({ success: false, message: 'Politician not found' });
    }

    // Check if politician is frozen due to brigading
    if (politician.isFrozen) {
      return res.status(403).json({
        success: false,
        message: '🚨 Rating Frozen: This profile is under Brigading Review. New votes are temporarily quarantined.',
      });
    }

    // Quadratic Credits Calculation: votesCount^2
    const safeVotes = Math.max(1, Math.min(10, Number(votesCount) || 1));
    const requiredCredits = safeVotes * safeVotes;

    const user = await User.findById(req.user._id);
    if (user.jantaPoints < requiredCredits) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Janta Points. Quadratic voting for ${safeVotes} votes requires ${requiredCredits} points. You have ${user.jantaPoints}.`,
      });
    }

    // Deduct credits from user
    user.jantaPoints -= requiredCredits;
    user.karmaPoints += 10 * safeVotes;
    user.updateKarmaTier();
    await user.save();

    // Check Geographic Relevance: Local voter gets 3x multiplier
    const isConstituencyVoter =
      (user.constituency && user.constituency.toLowerCase() === politician.constituency.toLowerCase()) ||
      (user.state && user.state.toLowerCase() === politician.state.toLowerCase());

    // Calculate single rating average
    const dimValues = Object.values(dimensions);
    const overallAverage = dimValues.reduce((a, b) => a + Number(b), 0) / Math.max(1, dimValues.length);

    // Save or update Rating
    let rating = await Rating.findOne({ user: user._id, politician: politician._id });
    if (rating) {
      rating.creditsSpent += requiredCredits;
      rating.effectiveVotes = Math.sqrt(rating.creditsSpent);
      rating.dimensions = dimensions;
      rating.overallAverage = overallAverage;
      rating.evidenceTier = evidenceTier;
      rating.evidenceUrl = evidenceUrl || rating.evidenceUrl;
      rating.weightApplied = user.votingPower;
      rating.isConstituencyVoter = isConstituencyVoter;
      await rating.save();
    } else {
      rating = await Rating.create({
        user: user._id,
        politician: politician._id,
        creditsSpent: requiredCredits,
        effectiveVotes: safeVotes,
        dimensions,
        overallAverage,
        evidenceTier,
        evidenceUrl: evidenceUrl || '',
        weightApplied: user.votingPower,
        isConstituencyVoter,
      });
    }

    // Fetch all active ratings for this politician
    const allRatings = await Rating.find({ politician: politician._id });

    // Fetch CMS weights
    const cmsConfig = await CmsConfig.findOne({ configKey: 'global_cms_config' });
    const weights = cmsConfig ? cmsConfig.formulaWeights : null;

    // Recalculate Politician Impact Score
    const updatedScoreData = recalculatePoliticianImpactScore(politician, allRatings, weights);

    // Update Politician document
    const oldScore = politician.impactScore;
    politician.impactScore = updatedScoreData.impactScore;
    politician.badgeTier = updatedScoreData.badgeTier;
    politician.badgeAltName = updatedScoreData.badgeAltName;
    politician.scoreBreakdown = updatedScoreData.scoreBreakdown;
    politician.dimensions = updatedScoreData.dimensions;
    politician.trendChange = Math.round((politician.impactScore - oldScore) * 10) / 10;
    politician.trendDirection = politician.trendChange > 0 ? 'improving' : politician.trendChange < 0 ? 'declining' : 'stable';

    // Record score history
    politician.scoreHistory.push({
      date: new Date(),
      score: politician.impactScore,
    });

    // Check Divergence
    politician.divergence = evaluateDivergence(
      politician.scoreBreakdown.objectiveData,
      politician.scoreBreakdown.communitySentiment
    );

    await politician.save();

    res.json({
      success: true,
      message: `Rating recorded! Cast ${safeVotes} quadratic vote(s) spending ${requiredCredits} Janta Points.`,
      rating,
      newImpactScore: politician.impactScore,
      scoreBreakdown: politician.scoreBreakdown,
      badgeTier: politician.badgeTier,
      divergence: politician.divergence,
      userRemainingPoints: user.jantaPoints,
      userKarmaTier: user.karmaTier,
    });
  } catch (err) {
    console.error('Rating error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
