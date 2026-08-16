const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['citizen', 'representative', 'moderator', 'superadmin'],
      default: 'citizen',
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PENDING_EMAIL_VERIFICATION', 'PENDING_ADMIN_VERIFICATION', 'REJECTED'],
      default: 'PENDING_EMAIL_VERIFICATION',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    credentialsDoc: {
      type: String, // Document URL or verification note
      default: '',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    // Pseudonymous phone hash (Zero Plaintext PII retention)
    phoneHash: {
      type: String,
      default: () => `hash_${Date.now()}_${Math.random()}`,
    },
    password: {
      type: String,
      required: true,
    },
    // Karma Tier
    karmaTier: {
      type: String,
      enum: ['nagrik', 'sakriya', 'prabhari', 'guardian'],
      default: 'nagrik',
    },
    karmaPoints: {
      type: Number,
      default: 50,
    },
    jantaPoints: {
      type: Number,
      default: 100, // XP / Spendable credit pool
    },
    votingPower: {
      type: Number,
      default: 0.5, // 0.5x Nagrik, 1.0x Sakriya, 2.0x Prabhari, 3.0x Guardian
    },
    constituency: {
      type: String,
      default: 'New Delhi',
    },
    state: {
      type: String,
      default: 'Delhi',
    },
    badges: [
      {
        id: String,
        name: String,
        icon: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    dailyStreak: {
      type: Number,
      default: 1,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    verifiedNagrik: {
      type: Boolean,
      default: false, // Optional UPI ₹11 verified trust badge
    },
    bio: {
      type: String,
      default: 'Democracy Enthusiast & JanAudit Citizen',
    },
    avatarSeed: {
      type: String,
      default: () => `avatar_${Math.floor(Math.random() * 1000)}`,
    },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    collectedCards: [{ type: String }],
  },
  { timestamps: true }
);

// Method to update karma tier based on points
userSchema.methods.updateKarmaTier = function () {
  if (this.karmaPoints >= 2000) {
    this.karmaTier = 'guardian';
    this.votingPower = 3.0;
  } else if (this.karmaPoints >= 500) {
    this.karmaTier = 'prabhari';
    this.votingPower = 2.0;
  } else if (this.karmaPoints >= 100) {
    this.karmaTier = 'sakriya';
    this.votingPower = 1.0;
  } else {
    this.karmaTier = 'nagrik';
    this.votingPower = 0.5;
  }
};

module.exports = mongoose.model('User', userSchema);
