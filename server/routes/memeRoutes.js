const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Politician = require('../models/Politician');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const MEME_TEMPLATES = [
  {
    id: 'template_1',
    title: 'Promise vs Reality Two-Panel',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=60',
    category: 'Jumla Expose',
    defaultTopText: 'Before Election: "World Class Roads"',
    defaultBottomText: 'After Election: Pothole Moon Craters',
  },
  {
    id: 'template_2',
    title: 'The Great Press Conference Silence',
    imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600&auto=format&fit=crop&q=60',
    category: 'Accountability',
    defaultTopText: 'When Asked About Fund Utilization',
    defaultBottomText: '"Next Question Please"',
  },
  {
    id: 'template_3',
    title: 'Asset Growth Anomaly Graph',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=60',
    category: 'Follow The Money',
    defaultTopText: 'Sensex Return: +74%',
    defaultBottomText: 'Neta Ji Net Worth: +1,978%',
  },
  {
    id: 'template_4',
    title: 'Missing In Action MLA',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60',
    category: 'Absenteeism',
    defaultTopText: 'Parliament Attendance: 14%',
    defaultBottomText: 'Instagram Reels Uploaded: 450',
  },
];

// @route GET /api/memes/templates
// @desc Get pre-loaded meme generator templates
router.get('/templates', (req, res) => {
  res.json({ success: true, templates: MEME_TEMPLATES });
});

// @route GET /api/memes/roast-cards
// @desc Get top viral roast/toast cards
router.get('/roast-cards', async (req, res) => {
  try {
    const roastPosts = await Post.find({
      roastToastTag: { $in: ['clown_behavior', 'actually_based', 'peak_corruption', 'sleeper_cell', 'drama_queen'] },
    })
      .populate('taggedPoliticians', 'name photo party constituency state impactScore')
      .sort({ 'reactions.skull': -1, 'reactions.clown': -1, createdAt: -1 })
      .limit(15);

    res.json({ success: true, count: roastPosts.length, roastCards: roastPosts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
