const mongoose = require('mongoose');

const bountySchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorHandle: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['RTI Document', 'Budget Audit', 'Pothole & Road Geo-proof', 'Hospital Inspection', 'School Records', 'General Evidence'],
      default: 'RTI Document',
    },
    targetPolitician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Politician',
    },
    targetDepartment: String,
    rewardPoints: {
      type: Number,
      default: 500, // Total pooled points
    },
    contributors: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        handle: String,
        points: { type: Number, default: 50 },
        contributedAt: { type: Date, default: Date.now },
      },
    ],
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'fulfilled', 'expired'],
      default: 'open',
    },
    proofSubmissions: [
      {
        submitter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        submitterHandle: String,
        evidenceUrl: String,
        description: String,
        submittedAt: { type: Date, default: Date.now },
        juryApprovals: { type: Number, default: 0 },
        juryRejections: { type: Number, default: 0 },
        isAwarded: { type: Boolean, default: false },
      },
    ],
    awardedTo: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      handle: String,
      awardedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bounty', bountySchema);
