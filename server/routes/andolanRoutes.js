const express = require('express');
const router = express.Router();
const AndolanRoom = require('../models/AndolanRoom');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @route GET /api/andolan/rooms
// @desc Get active 48-hour ephemeral protest rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await AndolanRoom.find({ isLive: true }).sort({ activeParticipants: -1, createdAt: -1 });
    res.json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/andolan/rooms
// @desc Launch new 48-hour Andolan Space
router.post('/rooms', protect, async (req, res) => {
  try {
    const { title, description, hashtag, state, constituency } = req.body;
    if (!title || !hashtag) {
      return res.status(400).json({ success: false, message: 'Title and Hashtag are required.' });
    }

    const roomCode = `ANDOLAN-${(state || 'IN').substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const room = await AndolanRoom.create({
      roomCode,
      title,
      description: description || 'Ephemeral anonymous civic coordination space.',
      hashtag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
      state: state || req.user.state || 'Delhi',
      constituency: constituency || req.user.constituency || 'New Delhi',
      activeParticipants: 1,
      messages: [
        {
          senderHandle: 'JanAudit Bot',
          senderKarmaTier: 'guardian',
          text: '📢 Welcome to this 48-Hour Andolan Space. Messages and history will self-destruct upon countdown expiry.',
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Andolan Mode Activated! Self-destruct timer initiated (48 hours).',
      room,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/andolan/rooms/:code
// @desc Get room details & message feed
router.get('/rooms/:code', async (req, res) => {
  try {
    const room = await AndolanRoom.findOne({ roomCode: req.params.code });
    if (!room) return res.status(404).json({ success: false, message: 'Andolan room not found or has self-destructed.' });

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
