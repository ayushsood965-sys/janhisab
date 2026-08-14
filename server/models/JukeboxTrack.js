const mongoose = require('mongoose');

const jukeboxTrackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      default: 'Anonymous Jan Awaaz',
    },
    genre: {
      type: String,
      enum: ['Protest Rap', 'Desh Bhakti Satire', 'Folk Awaaz', 'Whistleblower Tape (Masked)', 'Jumla Anthem', 'Podcast Audio'],
      default: 'Protest Rap',
    },
    duration: {
      type: String,
      default: '2:45',
    },
    audioUrl: {
      type: String,
      required: true,
    },
    coverArt: {
      type: String,
      default: '/covers/jukebox_default.png',
    },
    lyricsSnippet: String,
    targetPolitician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Politician',
    },
    targetPoliticianName: String,
    isVoiceMasked: {
      type: Boolean,
      default: false,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    plays: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JukeboxTrack', jukeboxTrackSchema);
