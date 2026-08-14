const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'hospital',
        'police_station',
        'municipality',
        'school',
        'pwd',
        'electricity_board',
        'water_board',
      ],
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    constituency: {
      type: String,
      required: true,
    },
    address: String,
    headOfficer: String,
    headOfficerDesignation: String,
    photo: {
      type: String,
      default: '/avatars/institution_default.png',
    },
    overallScore: {
      type: Number,
      default: 60,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    dimensions: {
      serviceQuality: { type: Number, default: 60 },
      responsiveness: { type: Number, default: 55 },
      cleanliness: { type: Number, default: 50 },
      corruptionFreeScore: { type: Number, default: 65 },
      infrastructureQuality: { type: Number, default: 58 },
    },
    budgetAllocatedCrores: {
      type: Number,
      default: 5.0,
    },
    budgetUtilizedCrores: {
      type: Number,
      default: 3.8,
    },
    issuesReportedCount: {
      type: Number,
      default: 0,
    },
    issuesResolvedCount: {
      type: Number,
      default: 0,
    },
    officialResponses: [
      {
        author: String,
        designation: String,
        message: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institution', institutionSchema);
