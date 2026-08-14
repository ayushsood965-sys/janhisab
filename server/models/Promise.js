const mongoose = require('mongoose');

const promiseSchema = new mongoose.Schema(
  {
    politician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Politician',
      required: true,
    },
    politicianName: String,
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
      enum: [
        'Infrastructure',
        'Healthcare',
        'Education',
        'Employment',
        'Agriculture',
        'Women Safety',
        'Environment',
        'Digital & Tech',
        'Welfare Schemes',
      ],
      default: 'Infrastructure',
    },
    manifestoYear: {
      type: Number,
      default: 2024,
    },
    sourceDocument: {
      type: String,
      default: 'Official Election Manifesto / Public Rally Speech',
    },
    sourceUrl: String,
    status: {
      type: String,
      enum: ['completed', 'in_progress', 'failed', 'not_started'],
      default: 'not_started',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    promiseDate: {
      type: Date,
      default: Date.now,
    },
    targetCompletionDate: Date,
    actualCompletionDate: Date,

    // Jumla Index
    isJumlaFlagged: {
      type: Boolean,
      default: false,
    },

    // Draggable "Promise vs Reality" Image Slider
    promiseVsReality: {
      hasSlider: { type: Boolean, default: false },
      promiseImageUrl: String,
      promiseCaption: String,
      realityImageUrl: String,
      realityCaption: String,
    },

    // Timeline of commits/milestones (GitHub for Governance)
    timeline: [
      {
        date: { type: Date, default: Date.now },
        title: String,
        description: String,
        evidenceUrl: String,
        sourceType: String,
        statusTag: String,
      },
    ],

    // Community Evidence Submissions
    communityEvidenceCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promise', promiseSchema);
