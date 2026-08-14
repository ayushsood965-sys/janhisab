const express = require('express');
const router = express.Router();
const NetaCard = require('../models/NetaCard');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @route GET /api/neta-cards
// @desc Get all collectible Neta Cards
router.get('/', optionalAuth, async (req, res) => {
  try {
    const cards = await NetaCard.find().populate('politician', 'name photo party state constituency impactScore');
    res.json({ success: true, count: cards.length, cards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/neta-cards/my-deck
// @desc Get user's unlocked cards
router.get('/my-deck', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const collectedCodes = user.collectedCards || [];
    const userCards = await NetaCard.find({ cardCode: { $in: collectedCodes } });

    res.json({
      success: true,
      totalCollected: userCards.length,
      cards: userCards,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/neta-cards/:code/collect
// @desc Claim/unlock a collectible card
router.post('/:code/collect', protect, async (req, res) => {
  try {
    const { code } = req.params;
    const card = await NetaCard.findOne({ cardCode: code });

    if (!card) return res.status(404).json({ success: false, message: 'Neta Card not found' });

    const user = await User.findById(req.user._id);
    if (!user.collectedCards.includes(code)) {
      user.collectedCards.push(code);
      user.jantaPoints += 20;
      await user.save();
    }

    res.json({
      success: true,
      message: `🎉 Neta Card "${card.politicianName}" added to your civic deck!`,
      card,
      deckCount: user.collectedCards.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
