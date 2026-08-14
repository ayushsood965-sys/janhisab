const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema(
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
      default: 'Civic Infrastructure',
    },
    state: {
      type: String,
      default: 'National',
    },
    constituency: {
      type: String,
      default: 'General',
    },
    targetPoliticians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Politician' }],
    targetDepartment: String,
    targetOfficialDesignation: String,
    
    signatureGoal: {
      type: Number,
      default: 1000,
    },
    currentSignatures: {
      type: Number,
      default: 1,
    },
    signatures: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        handle: String,
        signedAt: { type: Date, default: Date.now },
        comment: String,
      },
    ],
    
    // Milestones: 100, 1000, 10000, 100000
    milestoneReached: {
      type: Number,
      default: 0,
    },
    
    status: {
      type: String,
      enum: ['open', 'milestone_reached', 'notice_dispatched', 'responded', 'resolved'],
      default: 'open',
    },

    // Automated Notice to Official
    noticeDispatchedAt: Date,
    noticeDispatchMethod: {
      type: String,
      default: 'Public Dashboard & Official Tagging',
    },

    // Right of Reply / Official Response
    officialResponse: {
      hasReplied: { type: Boolean, default: false },
      responderName: String,
      responderDesignation: String,
      responseText: String,
      documentUrl: String,
      replyDate: Date,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Petition', petitionSchema);
