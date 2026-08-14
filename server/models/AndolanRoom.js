const mongoose = require('mongoose');

const andolanRoomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    hashtag: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    constituency: {
      type: String,
      required: true,
    },
    activeParticipants: {
      type: Number,
      default: 1,
    },
    peakParticipants: {
      type: Number,
      default: 1,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      index: { expires: 0 }, // Auto-destruct TTL
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    messages: [
      {
        senderHandle: String,
        senderKarmaTier: String,
        text: String,
        isSafetyAlert: { type: Boolean, default: false },
        mediaUrl: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    safetyAlerts: [
      {
        alertText: String,
        reportedBy: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    archivedSummary: {
      hasArchived: { type: Boolean, default: false },
      summaryText: String,
      totalInteractions: Number,
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AndolanRoom', andolanRoomSchema);
