const mongoose = require('mongoose');

const cmsConfigSchema = new mongoose.Schema(
  {
    configKey: {
      type: String,
      default: 'global_cms_config',
      unique: true,
    },
    // Dynamic Impact Score Formula Weights (Configurable by Super Admin)
    formulaWeights: {
      objectiveDataWeight: { type: Number, default: 0.45 },
      verifiedOutcomesWeight: { type: Number, default: 0.25 },
      communitySentimentWeight: { type: Number, default: 0.20 },
      trustRecencyWeight: { type: Number, default: 0.10 },
    },
    // Anti-IT Cell & Sybil parameters
    antiManipulation: {
      quadraticVotingEnabled: { type: Boolean, default: true },
      burstFreezeThresholdPct: { type: Number, default: 40 },
      burstWindowHours: { type: Number, default: 2 },
      ratingCooldownDays: { type: Number, default: 90 },
      constituencyVoterMultiplier: { type: Number, default: 3.0 },
    },
    // Decoupled Module Toggles
    modules: {
      voiceWall: { type: Boolean, default: true },
      politicians: { type: Boolean, default: true },
      institutions: { type: Boolean, default: true },
      promiseTracker: { type: Boolean, default: true },
      rtiFactory: { type: Boolean, default: true },
      petitions: { type: Boolean, default: true },
      constituencyMaps: { type: Boolean, default: true },
      memeStudio: { type: Boolean, default: true },
      protestJukebox: { type: Boolean, default: true },
      bountyBoard: { type: Boolean, default: true },
      netaCards: { type: Boolean, default: true },
      andolanMode: { type: Boolean, default: true },
      communityJury: { type: Boolean, default: true },
    },
    announcement: {
      enabled: { type: Boolean, default: true },
      text: {
        type: String,
        default: '⚖️ JanAudit Beta: Pro-Democracy. Pro-Transparency. Every promise tracked, every score explainable.',
      },
      link: { type: String, default: '/about' },
      badge: { type: String, default: 'PUBLIC AUDIT' },
    },
    auditLogs: [
      {
        adminHandle: String,
        action: String,
        details: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CmsConfig', cmsConfigSchema);
