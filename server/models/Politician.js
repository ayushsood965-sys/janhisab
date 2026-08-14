const mongoose = require('mongoose');

const politicianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      default: '/avatars/politician_default.png',
    },
    party: {
      type: String,
      required: true,
    },
    partySymbol: {
      type: String,
      default: '🗳️',
    },
    state: {
      type: String,
      required: true,
    },
    constituency: {
      type: String,
      required: true,
    },
    house: {
      type: String,
      enum: ['Lok Sabha', 'Vidhan Sabha', 'Rajya Sabha'],
      default: 'Lok Sabha',
    },
    roleTitle: {
      type: String,
      default: 'Member of Parliament',
    },
    education: {
      type: String,
      default: 'Graduate',
    },
    age: {
      type: Number,
      default: 52,
    },

    // Pillar 1: Objective Data Metrics (MyNeta, PRS, Digital Sansad)
    metrics: {
      attendanceRate: { type: Number, default: 75 }, // percentage 0-100
      nationalAvgAttendance: { type: Number, default: 79 },
      questionsAsked: { type: Number, default: 120 },
      nationalAvgQuestions: { type: Number, default: 160 },
      debatesParticipated: { type: Number, default: 35 },
      billsIntroduced: { type: Number, default: 4 },
      criminalCasesPending: { type: Number, default: 0 },
      criminalCasesConvicted: { type: Number, default: 0 },
      criminalChargesDetails: [String],
      fundUtilizationPct: { type: Number, default: 68 }, // MPLAD / MLALAD
      fundSanctionedCrores: { type: Number, default: 17.5 },
      fundUtilizedCrores: { type: Number, default: 11.9 },
      rtiComplianceRate: { type: Number, default: 60 },
      totalVerifiedEvidenceCount: { type: Number, default: 0 },
    },

    // Follow the Money Tracker (MyNeta / ADR Affidavits)
    assets: {
      declaredAssets2019: { type: Number, default: 2.5 }, // in Crores
      declaredAssets2024: { type: Number, default: 12.8 }, // in Crores
      assetGrowthPct: { type: Number, default: 412 },
      marketBenchmarkGrowthPct: { type: Number, default: 74 }, // Sensex benchmark
      assetGrowthAnomaly: { type: Boolean, default: false },
      declaredLiabilitiesCrores: { type: Number, default: 1.2 },
      declaredIncomeSources: [String],
      assetHistory: [
        {
          year: Number,
          amountCrores: Number,
        },
      ],
    },

    // Dynamic Impact Score™ (0-100) — Always computed
    impactScore: {
      type: Number,
      default: 50.0,
      min: 0,
      max: 100,
    },
    badgeTier: {
      type: String,
      enum: [
        'Janta ka Sher',
        'Kaam Karne Wala',
        'Theek Hai',
        'Sust Neta',
        'Jumla Champion',
        'Total Nautanki',
      ],
      default: 'Theek Hai',
    },
    badgeAltName: {
      type: String,
      default: 'Suspiciously Silent',
    },
    trendDirection: {
      type: String,
      enum: ['improving', 'declining', 'stable'],
      default: 'stable',
    },
    trendChange: {
      type: Number,
      default: 0,
    },

    // 4-Pillar Breakdown
    scoreBreakdown: {
      objectiveData: { type: Number, default: 50 }, // 45%
      verifiedOutcomes: { type: Number, default: 50 }, // 25%
      communitySentiment: { type: Number, default: 50 }, // 20%
      trustRecency: { type: Number, default: 50 }, // 10%
    },

    // Divergence Detection (Rotten Tomatoes dual score)
    divergence: {
      hasDivergence: { type: Boolean, default: false },
      kaamScore: { type: Number, default: 50 },
      jantaVoice: { type: Number, default: 50 },
      divergenceReason: { type: String, default: '' },
    },

    // Multi-Dimensional Ratings
    dimensions: {
      infrastructure: { type: Number, default: 50 },
      accessibility: { type: Number, default: 50 },
      promiseKeeping: { type: Number, default: 50 },
      transparency: { type: Number, default: 50 },
      legislative: { type: Number, default: 50 },
      social: { type: Number, default: 50 },
      economic: { type: Number, default: 50 },
    },

    // Promise Tracker summary
    promiseStats: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      inProgress: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      notStarted: { type: Number, default: 0 },
      jumlaPct: { type: Number, default: 0 },
    },

    // Score History for Trend Graphs
    scoreHistory: [
      {
        date: { type: Date, default: Date.now },
        score: Number,
      },
    ],

    // Official Responses (Right of Reply)
    officialResponses: [
      {
        author: String,
        designation: String,
        text: String,
        documentUrl: String,
        issueRef: String,
        date: { type: Date, default: Date.now },
        verified: { type: Boolean, default: true },
      },
    ],

    // Profile Anthem from Protest Jukebox
    profileAnthem: {
      title: String,
      artist: String,
      audioUrl: String,
      upvotes: { type: Number, default: 0 },
    },

    // Freeze & Brigading Status
    isFrozen: {
      type: Boolean,
      default: false,
    },
    freezeReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Politician', politicianSchema);
