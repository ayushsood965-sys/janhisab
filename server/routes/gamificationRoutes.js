const express = require('express');
const router = express.Router();
const Bounty = require('../models/Bounty');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// In-memory weekly Ghotala Awards state
let weeklyGhotalaAwards = [
  {
    id: 'ghotala_1',
    category: '🤡 "Peak Nautanki" of the Week',
    description: 'Claiming zero potholes in entire district while inaugurating boat ride on flooded main street',
    nominees: [
      { id: 'nom_1', name: 'MLA Sharma (Central Ward)', votes: 1420 },
      { id: 'nom_2', name: 'Corporator Verma (East Zone)', votes: 890 },
      { id: 'nom_3', name: 'MP Yadav (Metro North)', votes: 630 },
    ],
  },
  {
    id: 'ghotala_2',
    category: '🤥 "Biggest Jumla" of the Week',
    description: 'Promised 100-bed multispecialty hospital in 2019; plot currently functions as buffalo grazing field',
    nominees: [
      { id: 'nom_4', name: 'Minister Rathore (State Health)', votes: 2150 },
      { id: 'nom_5', name: 'MLA Patil (Industrial Belt)', votes: 1100 },
    ],
  },
  {
    id: 'ghotala_3',
    category: '😴 "Sleeping Beauty" of the Week',
    description: '0 Parliament questions asked in 3 years; 98% attendance at foreign delegation dinners',
    nominees: [
      { id: 'nom_6', name: 'MP Banerjee (Coastal Seat)', votes: 1890 },
      { id: 'nom_7', name: 'MLA Joshi (Hills District)', votes: 940 },
    ],
  },
  {
    id: 'ghotala_4',
    category: '👑 "Actually Based" of the Week',
    description: 'Completed rural water pipeline 4 months ahead of schedule with 100% geo-verified audit',
    nominees: [
      { id: 'nom_8', name: 'MLA Thomas (South Constituency)', votes: 3420 },
      { id: 'nom_9', name: 'DM Iyer (District Collectorate)', votes: 2980 },
    ],
  },
];

// @route GET /api/gamification/bounties
// @desc Get open investigation bounties
router.get('/bounties', async (req, res) => {
  try {
    const bounties = await Bounty.find()
      .populate('targetPolitician', 'name photo party constituency state')
      .sort({ rewardPoints: -1, createdAt: -1 });

    res.json({ success: true, count: bounties.length, bounties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/gamification/bounties
// @desc Create a new investigation bounty
router.post('/bounties', protect, async (req, res) => {
  try {
    const { title, description, category, targetPolitician, targetDepartment, initialPoints = 200 } = req.body;
    const user = await User.findById(req.user._id);

    if (user.jantaPoints < initialPoints) {
      return res.status(400).json({ success: false, message: 'Insufficient Janta Points to launch bounty.' });
    }

    user.jantaPoints -= Number(initialPoints);
    user.karmaPoints += 30;
    await user.save();

    const bounty = await Bounty.create({
      creator: user._id,
      creatorHandle: user.handle,
      title,
      description,
      category: category || 'RTI Document',
      targetPolitician: targetPolitician || undefined,
      targetDepartment: targetDepartment || 'Public Works',
      rewardPoints: Number(initialPoints),
      contributors: [
        {
          user: user._id,
          handle: user.handle,
          points: Number(initialPoints),
          contributedAt: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: `Bounty launched with ${initialPoints} points pooled reward!`,
      bounty,
      userRemainingPoints: user.jantaPoints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/gamification/bounties/:id/contribute
// @desc Pool additional points into existing bounty
router.post('/bounties/:id/contribute', protect, async (req, res) => {
  try {
    const { points = 100 } = req.body;
    const user = await User.findById(req.user._id);

    if (user.jantaPoints < points) {
      return res.status(400).json({ success: false, message: 'Insufficient Janta Points.' });
    }

    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found' });

    user.jantaPoints -= Number(points);
    bounty.rewardPoints += Number(points);
    bounty.contributors.push({
      user: user._id,
      handle: user.handle,
      points: Number(points),
      contributedAt: new Date(),
    });

    await user.save();
    await bounty.save();

    res.json({
      success: true,
      message: `Added +${points} points to investigation pool! Total reward is now ${bounty.rewardPoints} XP.`,
      rewardPoints: bounty.rewardPoints,
      userRemainingPoints: user.jantaPoints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/gamification/bounties/:id/submit-proof
// @desc Submit evidence to claim bounty
router.post('/bounties/:id/submit-proof', protect, async (req, res) => {
  try {
    const { evidenceUrl, description } = req.body;
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) return res.status(404).json({ success: false, message: 'Bounty not found' });

    bounty.proofSubmissions.push({
      submitter: req.user._id,
      submitterHandle: req.user.handle,
      evidenceUrl,
      description,
      submittedAt: new Date(),
      juryApprovals: 1,
    });

    bounty.status = 'under_review';
    await bounty.save();

    res.json({
      success: true,
      message: 'Investigation evidence submitted! Community Jury verification in progress for reward payout.',
      proofSubmissions: bounty.proofSubmissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/gamification/ghotala-awards
// @desc 🏆 Weekly Ghotala Awards nominations and votes
router.get('/ghotala-awards', (req, res) => {
  res.json({ success: true, awards: weeklyGhotalaAwards });
});

// @route POST /api/gamification/ghotala-awards/vote
// @desc Vote for weekly Ghotala Award nominee
router.post('/ghotala-awards/vote', protect, (req, res) => {
  const { awardId, nomineeId } = req.body;
  const award = weeklyGhotalaAwards.find((a) => a.id === awardId);
  if (award) {
    const nominee = award.nominees.find((n) => n.id === nomineeId);
    if (nominee) {
      nominee.votes += 1;
    }
  }
  res.json({ success: true, awards: weeklyGhotalaAwards });
});

module.exports = router;
