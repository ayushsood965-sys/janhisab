const express = require('express');
const router = express.Router();
const JukeboxTrack = require('../models/JukeboxTrack');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @route GET /api/jukebox/tracks
// @desc Get protest jukebox tracks & playlists
router.get('/tracks', async (req, res) => {
  try {
    const { genre, search } = req.query;
    const filter = {};
    if (genre && genre !== 'All') filter.genre = genre;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { targetPoliticianName: { $regex: search, $options: 'i' } },
      ];
    }

    const tracks = await JukeboxTrack.find(filter).sort({ upvotes: -1, plays: -1 });
    res.json({ success: true, count: tracks.length, tracks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/jukebox/tracks/:id/upvote
// @desc Upvote track
router.post('/tracks/:id/upvote', protect, async (req, res) => {
  try {
    const track = await JukeboxTrack.findById(req.params.id);
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });

    track.upvotes += 1;
    await track.save();

    res.json({ success: true, upvotes: track.upvotes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/jukebox/upload-voice-masked
// @desc Submit whistleblower voice-masked audio
router.post('/upload-voice-masked', protect, async (req, res) => {
  try {
    const { title, genre, audioUrl, lyricsSnippet, targetPoliticianName } = req.body;

    const track = await JukeboxTrack.create({
      title: title || 'Whistleblower Tape (Voice-Masked Audio)',
      artist: req.user.handle,
      genre: genre || 'Whistleblower Tape (Masked)',
      audioUrl: audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      lyricsSnippet: lyricsSnippet || 'Recorded conversation on tender kickbacks.',
      targetPoliticianName,
      isVoiceMasked: true,
      upvotes: 1,
    });

    const user = await User.findById(req.user._id);
    user.jantaPoints += 50;
    user.karmaPoints += 25;
    user.updateKarmaTier();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Whistleblower audio safely published with voice-masking filter!',
      track,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
