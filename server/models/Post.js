const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorHandle: {
      type: String,
      required: true,
    },
    authorKarmaTier: {
      type: String,
      default: 'nagrik',
    },
    postType: {
      type: String,
      enum: ['text', 'meme', 'audio', 'video', 'evidence', 'petition', 'poll'],
      default: 'text',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: String,
    mediaThumbnail: String,
    // Evidence Level Badges (🟢 Verified, 🟡 Likely, ⚪ Opinion, 🔴 Disputed)
    evidenceLevel: {
      type: String,
      enum: ['verified', 'likely', 'opinion', 'disputed'],
      default: 'opinion',
    },
    evidenceSources: [
      {
        title: String,
        url: String,
        sourceType: {
          type: String,
          enum: ['rti_document', 'news_report', 'gazette', 'court_order', 'geotagged_photo', 'affidavit'],
          default: 'news_report',
        },
      },
    ],
    // Corroboration: Seal of Janta
    isCorroborated: {
      type: Boolean,
      default: false,
    },
    corroborationCount: {
      type: Number,
      default: 0,
    },
    corroborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Location & Entity Tagging
    state: { type: String, default: 'National' },
    constituency: { type: String, default: 'General' },
    category: {
      type: String,
      enum: [
        'Corruption',
        'Infrastructure',
        'Education',
        'Healthcare',
        'Employment',
        'Environment',
        'Women Safety',
        'Farmer Issues',
        'Governance',
        'General Satire',
      ],
      default: 'Governance',
    },
    hashtags: [String],
    taggedPoliticians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Politician' }],
    taggedInstitutions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Institution' }],

    // Roast / Toast Tags
    roastToastTag: {
      type: String,
      enum: ['clown_behavior', 'actually_based', 'peak_corruption', 'sleeper_cell', 'drama_queen', 'none'],
      default: 'none',
    },

    // Custom Political Reactions
    reactions: {
      fire: { type: Number, default: 0 }, // 🔥 Viral/Expose
      skull: { type: Number, default: 0 }, // 💀 Expose/Dead governance
      rofl: { type: Number, default: 0 }, // 😂 Meme
      clown: { type: Number, default: 0 }, // 🤡 Jumla
      solidarity: { type: Number, default: 0 }, // ✊ Solidarity
      needsEvidence: { type: Number, default: 0 }, // 🧾 Questionable claim
    },
    userReactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reactionType: String,
      },
    ],

    // Comments
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorHandle: String,
        authorKarmaTier: String,
        content: String,
        evidenceUrl: String,
        upvotes: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Boost with Janta Points
    boostScore: {
      type: Number,
      default: 0,
    },

    // Unverified Friction Queue
    isFrictionUnverified: {
      type: Boolean,
      default: false,
    },

    // Poll options if postType === 'poll'
    pollData: {
      question: String,
      options: [
        {
          text: String,
          votes: { type: Number, default: 0 },
        },
      ],
      voters: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          optionIndex: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

// Index for fast search and hashtag discovery
postSchema.index({ title: 'text', content: 'text', hashtags: 'text' });

module.exports = mongoose.model('Post', postSchema);
