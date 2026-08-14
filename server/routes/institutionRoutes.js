const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @route GET /api/institutions
// @desc Get public institutions with category filters
router.get('/', async (req, res) => {
  try {
    const { category, state, constituency, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (state && state !== 'All') filter.state = state;
    if (constituency && constituency !== 'All') filter.constituency = constituency;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { headOfficer: { $regex: search, $options: 'i' } },
      ];
    }

    const institutions = await Institution.find(filter).sort({ overallScore: -1 });
    res.json({ success: true, count: institutions.length, institutions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/institutions/:id
// @desc Get single institution details
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
    res.json({ success: true, institution });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/institutions/:id/feedback
// @desc Submit structured feedback for public institution
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const { dimensions, experienceNotes } = req.body;
    const institution = await Institution.findById(req.params.id);

    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });

    if (dimensions) {
      const dimVals = Object.values(dimensions);
      const avg = dimVals.reduce((a, b) => a + Number(b), 0) / Math.max(1, dimVals.length);
      institution.overallScore = Math.round((institution.overallScore * institution.ratingsCount + avg) / (institution.ratingsCount + 1));
      institution.ratingsCount += 1;
      institution.dimensions = { ...institution.dimensions.toObject(), ...dimensions };
    }

    await institution.save();

    const user = await User.findById(req.user._id);
    user.jantaPoints += 15;
    user.karmaPoints += 10;
    await user.save();

    res.json({
      success: true,
      message: 'Structured citizen feedback recorded!',
      institution,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
