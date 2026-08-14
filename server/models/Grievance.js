const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema(
  {
    grievanceTicketId: {
      type: String,
      required: true,
      unique: true,
    },
    complainantHandle: {
      type: String,
      default: 'Anonymous Citizen',
    },
    complainantContactHash: String,
    category: {
      type: String,
      enum: [
        'defamation_without_evidence',
        'hate_speech_or_communal',
        'doxxing_private_info',
        'fake_information',
        'harassment',
        'other',
      ],
      required: true,
    },
    targetPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    contentUrl: String,
    description: {
      type: String,
      required: true,
    },
    supportingProofUrl: String,
    
    // Status and SLAs under IT Rules 2021
    status: {
      type: String,
      enum: ['received', 'acknowledged', 'under_review', 'action_taken', 'dismissed'],
      default: 'received',
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now,
    },
    sla24hMet: {
      type: Boolean,
      default: true,
    },
    slaDeadline15d: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    resolvedAt: Date,
    actionTaken: {
      type: String,
      enum: ['none', 'friction_badge_applied', 'quarantined', 'removed_under_order', 'dismissed_public_interest'],
      default: 'none',
    },
    resolutionRemarks: String,
    grievanceOfficerName: {
      type: String,
      default: 'Adv. R. Narayanan (Grievance Redressal Officer)',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grievance', grievanceSchema);
