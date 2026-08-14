const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    politician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Politician',
      required: true,
    },
    creditsSpent: {
      type: Number,
      default: 1, // Quadratic vote pool credits (1, 4, 9, 16, 25)
    },
    effectiveVotes: {
      type: Number,
      default: 1, // sqrt(creditsSpent)
    },
    dimensions: {
      infrastructure: { type: Number, required: true, min: 0, max: 100 },
      accessibility: { type: Number, required: true, min: 0, max: 100 },
      promiseKeeping: { type: Number, required: true, min: 0, max: 100 },
      transparency: { type: Number, required: true, min: 0, max: 100 },
      legislative: { type: Number, required: true, min: 0, max: 100 },
      social: { type: Number, required: true, min: 0, max: 100 },
      economic: { type: Number, required: true, min: 0, max: 100 },
    },
    overallAverage: {
      type: Number,
      required: true,
    },
    evidenceTier: {
      type: Number,
      enum: [1, 2, 3], // Tier 1: 3x, Tier 2: 1.5x, Tier 3: 1x
      default: 3,
    },
    evidenceUrl: String,
    weightApplied: {
      type: Number,
      default: 1.0,
    },
    isConstituencyVoter: {
      type: Boolean,
      default: false,
    },
    isQuarantined: {
      type: Boolean,
      default: false, // Flagged if part of a brigading burst
    },
  },
  { timestamps: true }
);

// Ensure 90-day cooldown per politician per user
ratingSchema.index({ user: 1, politician: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
