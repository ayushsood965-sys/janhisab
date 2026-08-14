const mongoose = require('mongoose');

const rtiTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Road & Infrastructure',
        'Hospital & Medicines',
        'School & Teacher Vacancies',
        'Municipal Budget & Sanitation',
        'Police Complaint Action',
        'MPLAD / MLALAD Funds',
        'Ration & PDS Scheme',
        'Environment & Pollution',
      ],
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    description: String,
    targetAuthority: String,
    applicationQuestions: [
      {
        questionNumber: Number,
        text: String,
      },
    ],
    filingFee: {
      type: String,
      default: '₹10 (Indian Postal Order / Online RTI Portal)',
    },
    pioDesignation: {
      type: String,
      default: 'Public Information Officer (PIO)',
    },
    guidanceNotes: [String],
    downloadCount: {
      type: Number,
      default: 0,
    },
    uploadedResponses: [
      {
        userHandle: String,
        uploadedAt: { type: Date, default: Date.now },
        title: String,
        documentUrl: String,
        summary: String,
        keyExpose: String,
        verifiedByJury: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RtiTemplate', rtiTemplateSchema);
