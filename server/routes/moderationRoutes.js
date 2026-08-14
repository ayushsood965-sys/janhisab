const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const Post = require('../models/Post');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/authMiddleware');

// In-memory Community Jury queue items
let communityJuryQueue = [
  {
    id: 'jury_1',
    postTitle: 'Claim: ₹42 Crore Smart City Drain Budget Siphoned in Ward 12',
    postContent: 'RTI documents show contractor was paid 100% advance in Dec 2023, but satellite imagery shows zero construction.',
    evidenceSources: ['RTI Copy #DL-2024-88', 'Before-After Satellite Overlays'],
    taggedPolitician: 'MLA Sharma',
    currentVotes: { verified: 12, insufficient: 2, misleading: 1 },
  },
  {
    id: 'jury_2',
    postTitle: 'Claim: Hospital ICU Ventilators Missing During Night Shift',
    postContent: 'Video clip shows ICU ward locked with handwritten note directing patients to private nursing home.',
    evidenceSources: ['Geotagged Video 14-Aug-2026'],
    taggedPolitician: 'Civil Hospital Authority',
    currentVotes: { verified: 18, insufficient: 1, misleading: 0 },
  },
];

// @route POST /api/moderation/grievance
// @desc File official complaint under IT Rules 2021
router.post('/grievance', async (req, res) => {
  try {
    const { complainantHandle, complainantContact, category, targetPostId, description, supportingProofUrl } = req.body;
    
    if (!category || !description) {
      return res.status(400).json({ success: false, message: 'Category and description are mandatory.' });
    }

    const ticketId = `GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const grievance = await Grievance.create({
      grievanceTicketId: ticketId,
      complainantHandle: complainantHandle || 'Anonymous Complainant',
      complainantContactHash: complainantContact ? 'CONFIDENTIAL_HASHED' : 'ANONYMOUS',
      category,
      targetPost: targetPostId || undefined,
      description,
      supportingProofUrl: supportingProofUrl || '',
      status: 'acknowledged',
      acknowledgedAt: new Date(),
      sla24hMet: true,
      slaDeadline15d: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: 'Grievance officially registered under IT Rules 2021. Acknowledged within 24-hour SLA.',
      ticketId: grievance.grievanceTicketId,
      grievance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/moderation/grievances
// @desc List grievances
router.get('/grievances', async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ createdAt: -1 });
    res.json({ success: true, count: grievances.length, grievances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/moderation/community-jury/queue
// @desc Get items pending Community Jury verification
router.get('/community-jury/queue', async (req, res) => {
  res.json({ success: true, queue: communityJuryQueue });
});

// @route POST /api/moderation/community-jury/vote
// @desc Submit Lokpal Jury verdict on disputed claim
router.post('/community-jury/vote', protect, async (req, res) => {
  try {
    const { itemId, voteType } = req.body; // 'verified', 'insufficient', 'misleading'
    const item = communityJuryQueue.find((q) => q.id === itemId);

    if (item && item.currentVotes[voteType] !== undefined) {
      item.currentVotes[voteType] += 1;
    }

    const user = await User.findById(req.user._id);
    user.karmaPoints += 10;
    user.jantaPoints += 15;
    user.updateKarmaTier();
    await user.save();

    res.json({
      success: true,
      message: 'Verdict recorded on Lokpal Evidence ledger.',
      currentVotes: item?.currentVotes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// In-memory fact-check registry items
let factChecks = [
  {
    id: 'fc_1',
    claim: 'Government spent ₹120 Cr on Flyover repairs in 2025',
    verdict: 'PARTLY_TRUE',
    explanation: 'RTI documents reveal ₹65 Cr was allocated for flyovers, while remaining ₹55 Cr was shifted to drainage pipelines.',
    officialSources: ['Ministry of Road Transport Gazette #441', 'Delhi PWD Audit Report 2025'],
    author: 'Lokpal_Jury_Head',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// @route GET /api/moderation/fact-checks
// @desc Get fact check registry
router.get('/fact-checks', async (req, res) => {
  res.json({ success: true, factChecks });
});

// @route POST /api/moderation/fact-checks
// @desc Create new fact check entry (moderator / admin)
router.post('/fact-checks', protect, async (req, res) => {
  try {
    const { claim, verdict, explanation, officialSources } = req.body;
    const newFactCheck = {
      id: `fc_${Date.now()}`,
      claim,
      verdict: verdict || 'VERIFIED_TRUE',
      explanation,
      officialSources: Array.isArray(officialSources) ? officialSources : [officialSources],
      author: req.user.handle,
      createdAt: new Date(),
    };
    factChecks.unshift(newFactCheck);
    res.status(201).json({ success: true, message: 'Fact-Check record published to Public Registry', factCheck: newFactCheck });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/moderation/upgrade-evidence
// @desc Upgrade post evidence tier
router.post('/upgrade-evidence', protect, async (req, res) => {
  try {
    const { postId, newLevel } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.evidenceLevel = newLevel || 'verified';
    if (newLevel === 'verified') post.isCorroborated = true;
    await post.save();

    res.json({ success: true, message: `Evidence level upgraded to ${newLevel}`, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
