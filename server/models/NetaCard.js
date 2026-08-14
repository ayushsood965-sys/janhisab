const mongoose = require('mongoose');

const netaCardSchema = new mongoose.Schema(
  {
    politician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Politician',
      required: true,
      unique: true,
    },
    cardCode: {
      type: String,
      unique: true,
      required: true,
    },
    politicianName: String,
    photo: String,
    party: String,
    state: String,
    constituency: String,
    house: String,
    
    // Rarity: Common (Silver), Rare (Gold), Legendary (Holographic Crimson/Neon)
    rarity: {
      type: String,
      enum: ['common', 'rare', 'legendary'],
      default: 'common',
    },
    specialTitle: {
      type: String,
      default: 'The Public Representative',
    },
    tagline: String,
    roastQuote: String,
    
    // Stat snapshots
    impactScore: Number,
    attendanceRate: Number,
    promisesKeptRatio: String, // e.g. "4/15 Kept"
    criminalCasesCount: Number,
    assetGrowthPct: Number,
    
    // Card visuals
    glowColor: {
      type: String,
      default: '#10B981',
    },
    cardType: {
      type: String,
      enum: ['accountable', 'jumla_king', 'sleeper_cell', 'lion_of_janta'],
      default: 'accountable',
    },
    unlockCondition: {
      type: String,
      default: 'Visit profile or interact with constituency posts',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NetaCard', netaCardSchema);
