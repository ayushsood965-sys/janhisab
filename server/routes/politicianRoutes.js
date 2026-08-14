const express = require('express');
const router = express.Router();
const Politician = require('../models/Politician');
const Rating = require('../models/Rating');
const Post = require('../models/Post');
const PromiseModel = require('../models/Promise');
const { protect, optionalAuth, requireRole } = require('../middleware/authMiddleware');
const { evaluateDivergence } = require('../services/divergenceEngine');
const { recalculatePoliticianImpactScore } = require('../services/impactScoreEngine');
const CmsConfig = require('../models/CmsConfig');

// @route GET /api/politicians/ticker
// @desc Top 5 (Wall of Fame) vs Bottom 5 (Wall of Shame)
router.get('/ticker', async (req, res) => {
  try {
    const topFame = await Politician.find({ isFrozen: false })
      .sort({ impactScore: -1 })
      .limit(5)
      .select('name photo party state constituency impactScore badgeTier trendDirection trendChange');

    const bottomShame = await Politician.find({ isFrozen: false })
      .sort({ impactScore: 1 })
      .limit(5)
      .select('name photo party state constituency impactScore badgeTier trendDirection trendChange');

    res.json({
      success: true,
      wallOfFame: topFame,
      wallOfShame: bottomShame,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/politicians
// @desc Query politicians directory with filters
router.get('/', async (req, res) => {
  try {
    const { search, state, party, house, minScore, maxScore, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { constituency: { $regex: search, $options: 'i' } },
        { party: { $regex: search, $options: 'i' } },
      ];
    }

    if (state && state !== 'All') filter.state = state;
    if (party && party !== 'All') filter.party = party;
    if (house && house !== 'All') filter.house = house;
    if (minScore || maxScore) {
      filter.impactScore = {};
      if (minScore) filter.impactScore.$gte = Number(minScore);
      if (maxScore) filter.impactScore.$lte = Number(maxScore);
    }

    let sortOptions = { impactScore: -1 };
    if (sort === 'score_asc') sortOptions = { impactScore: 1 };
    else if (sort === 'attendance_desc') sortOptions = { 'metrics.attendanceRate': -1 };
    else if (sort === 'asset_growth_desc') sortOptions = { 'assets.assetGrowthPct': -1 };
    else if (sort === 'criminal_cases_desc') sortOptions = { 'metrics.criminalCasesPending': -1 };

    const total = await Politician.countDocuments(filter);
    const politicians = await Politician.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      politicians,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/politicians/:id
// @desc Get single politician profile with full breakdown, divergence & promises
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const politician = await Politician.findById(req.params.id);
    if (!politician) {
      return res.status(404).json({ success: false, message: 'Politician not found' });
    }

    // Evaluate Divergence (Rotten Tomatoes Dual Score)
    const divergence = evaluateDivergence(
      politician.scoreBreakdown?.objectiveData || 50,
      politician.scoreBreakdown?.communitySentiment || 50
    );
    politician.divergence = divergence;

    // Fetch related promises
    const promises = await PromiseModel.find({ politician: politician._id }).sort({ createdAt: -1 });

    // Fetch related voice wall posts
    const taggedPosts = await Post.find({ taggedPoliticians: politician._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch user's prior rating if logged in
    let userRating = null;
    if (req.user) {
      userRating = await Rating.findOne({ user: req.user._id, politician: politician._id });
    }

    res.json({
      success: true,
      politician,
      promises,
      taggedPosts,
      userRating,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/politicians/:id/reply
// @desc Submit Official Response under Right of Reply
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { designation, text, documentUrl, issueRef } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Response text is required' });
    }

    const politician = await Politician.findById(req.params.id);
    if (!politician) {
      return res.status(404).json({ success: false, message: 'Politician not found' });
    }

    politician.officialResponses.unshift({
      author: req.user.handle,
      designation: designation || 'Verified Official Representative',
      text,
      documentUrl: documentUrl || '',
      issueRef: issueRef || 'General Public Scrutiny',
      date: new Date(),
      verified: true,
    });

    await politician.save();

    res.json({
      success: true,
      message: 'Official Right of Reply statement successfully published.',
      officialResponses: politician.officialResponses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/politicians/:id/anthem
// @desc Set or upvote Protest Jukebox Profile Anthem
router.post('/:id/anthem', protect, async (req, res) => {
  try {
    const { title, artist, audioUrl } = req.body;
    const politician = await Politician.findById(req.params.id);
    if (!politician) {
      return res.status(404).json({ success: false, message: 'Politician not found' });
    }

    politician.profileAnthem = {
      title,
      artist,
      audioUrl,
      upvotes: (politician.profileAnthem?.upvotes || 0) + 1,
    };

    await politician.save();

    res.json({
      success: true,
      message: 'Profile anthem set successfully.',
      profileAnthem: politician.profileAnthem,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/politicians
// @desc Create new politician profile (Super Admin)
router.post('/', protect, async (req, res) => {
  try {
    const { name, party, partySymbol, state, constituency, house, photo, metrics, assets, bio } = req.body;
    const politician = await Politician.create({
      name,
      party,
      partySymbol: partySymbol || '🏛️',
      state,
      constituency,
      house: house || 'Lok Sabha',
      photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      bio: bio || 'Public Representative',
      metrics: metrics || { attendanceRate: 85, debatesParticipated: 20, questionsAsked: 50, privateMemberBills: 2, fundUtilizationPct: 80, criminalCasesPending: 0 },
      assets: assets || { declaredWorthCrores: 5.2, assetGrowthPct: 15, assetGrowthAnomaly: false },
      impactScore: 75.0,
      badgeTier: 'Kaam Karne Wala',
    });

    res.status(201).json({ success: true, message: 'Politician created successfully', politician });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/politicians/:id
// @desc Update politician profile (Super Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const politician = await Politician.findById(req.params.id);
    if (!politician) return res.status(404).json({ success: false, message: 'Politician not found' });

    const { name, party, partySymbol, state, constituency, house, photo, metrics, assets, bio, impactScore, isFrozen } = req.body;
    if (name) politician.name = name;
    if (party) politician.party = party;
    if (partySymbol) politician.partySymbol = partySymbol;
    if (state) politician.state = state;
    if (constituency) politician.constituency = constituency;
    if (house) politician.house = house;
    if (photo) politician.photo = photo;
    if (bio) politician.bio = bio;
    if (metrics) politician.metrics = { ...politician.metrics, ...metrics };
    if (assets) politician.assets = { ...politician.assets, ...assets };
    if (impactScore !== undefined) politician.impactScore = impactScore;
    if (isFrozen !== undefined) politician.isFrozen = isFrozen;

    await politician.save();
    res.json({ success: true, message: 'Politician updated successfully', politician });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/politicians/:id
// @desc Delete politician profile (Super Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const politician = await Politician.findById(req.params.id);
    if (!politician) return res.status(404).json({ success: false, message: 'Politician not found' });

    await Politician.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Politician deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
