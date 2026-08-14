const express = require('express');
const router = express.Router();
const RtiTemplate = require('../models/RtiTemplate');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// In-memory or persisted user custom draft storage
let userDrafts = [
  {
    id: 'draft_1',
    applicantName: 'Citizen Rahul',
    department: 'Public Works Department (PWD)',
    subject: 'Road Repair & Tender Quality Audit Specifications',
    queries: ['1. Certified copy of tender contract', '2. Quality audit report', '3. Total payment released'],
    createdAt: new Date(),
  },
];

// @route GET /api/rtis/templates or /api/rti/templates
// @desc Get RTI templates by category
router.get('/templates', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const templates = await RtiTemplate.find(filter).sort({ downloadCount: -1 });
    res.json({ success: true, count: templates.length, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/rtis/templates/:id
// @desc Get single template details
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await RtiTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    
    template.downloadCount += 1;
    await template.save();

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/rtis/generate
// @desc Generate customized RTI Application Draft
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { templateId, applicantName, applicantAddress, targetDistrict, targetState, specificLocation, customQuestions } = req.body;
    const template = await RtiTemplate.findById(templateId);

    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

    const draftDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const formattedApplication = `
FORM 'A' — APPLICATION FOR INFORMATION UNDER RTI ACT 2005
===========================================================

To,
The Public Information Officer (PIO),
Office of: ${template.department}
Location / District: ${targetDistrict || 'District Head Office'}, ${targetState || 'State'}

1. Full Name of Applicant: ${applicantName || 'Citizen of India'}
2. Address for Communication: ${applicantAddress || 'Confidential / As per Verified Portal Record'}
3. Subject Matter: Application for Information regarding ${template.title} in respect of ${specificLocation || 'the designated constituency/ward'}.

4. SPECIFIC INFORMATION SOUGHT UNDER SECTION 6(1) OF RTI ACT, 2005:
-------------------------------------------------------------------
${(customQuestions && customQuestions.length > 0 ? customQuestions : template.applicationQuestions)
  .map((q, idx) => `   (${idx + 1}) ${q.text || q}`)
  .join('\n\n')}

5. Period to which the information relates: Last 3 Financial Years up to Current Date
6. Application Fee Details: ₹10 (IPO / Demand Draft / Online Portal Transaction No.)
7. BPL Status: No (Fee Paid) / Yes (Exempt under Sec 7(5))

Declaration:
I hereby state that the information sought above is for public good and transparency in governance.

Date: ${draftDate}
Place: ${targetDistrict || 'India'}
Signature of Applicant: ___________________________
`;

    res.json({
      success: true,
      draftText: formattedApplication,
      templateTitle: template.title,
      pioDesignation: template.pioDesignation,
      filingFee: template.filingFee,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/rtis/generate-draft
// @desc Direct draft creation from Citizen Dashboard Form 'A'
router.post('/generate-draft', optionalAuth, async (req, res) => {
  try {
    const { department, subject, queries, applicantName, applicantAddress } = req.body;
    const newDraft = {
      id: `draft_${Date.now()}`,
      applicantName: applicantName || 'Citizen Nagrik',
      department: department || 'Public Works Department (PWD)',
      subject: subject || 'Civic Audit Information Request',
      queries: Array.isArray(queries) ? queries : [queries],
      createdAt: new Date(),
    };
    userDrafts.unshift(newDraft);

    res.json({
      success: true,
      message: 'Form "A" RTI draft created successfully',
      draft: newDraft,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/rtis/vault or /api/rti/vault
// @desc Searchable archive of all uploaded RTI responses & drafts
router.get('/vault', async (req, res) => {
  try {
    const templates = await RtiTemplate.find({ 'uploadedResponses.0': { $exists: true } });
    const allResponses = [];

    templates.forEach((t) => {
      if (Array.isArray(t.uploadedResponses)) {
        t.uploadedResponses.forEach((resp) => {
          const respObj = typeof resp.toObject === 'function' ? resp.toObject() : resp;
          allResponses.push({
            templateId: t._id,
            templateTitle: t.title,
            category: t.category,
            department: t.department,
            ...respObj,
          });
        });
      }
    });

    const drafts = Array.isArray(userDrafts) ? userDrafts : [];

    res.json({
      success: true,
      count: allResponses.length + drafts.length,
      responses: allResponses,
      records: [...drafts, ...allResponses],
    });
  } catch (err) {
    console.error('RTI Vault error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/rtis/upload-response
// @desc Upload received RTI response to public vault
router.post('/upload-response', protect, async (req, res) => {
  try {
    const { templateId, title, documentUrl, summary, keyExpose } = req.body;
    const template = await RtiTemplate.findById(templateId || '66ba11111111111111111111');

    if (template) {
      template.uploadedResponses.unshift({
        userHandle: req.user.handle,
        title: title || `${template.title} Official Response`,
        documentUrl,
        summary,
        keyExpose: keyExpose || 'Public records uploaded for community verification.',
        verifiedByJury: true,
        uploadedAt: new Date(),
      });
      await template.save();
    }

    // Reward user with high karma (Tier 1 Evidence: +100 Janta Points, +50 Karma)
    const user = await User.findById(req.user._id);
    user.jantaPoints += 100;
    user.karmaPoints += 50;
    user.updateKarmaTier();
    user.badges.push({
      id: 'rti_warrior',
      name: 'RTI Warrior',
      icon: '📜',
      description: 'Submitted verified government RTI disclosure to public vault',
    });
    await user.save();

    res.json({
      success: true,
      message: 'RTI Response successfully published to JanAudit Public Vault! Earned +100 XP.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/rtis/leaderboard
// @desc "RTI League" top citizen RTI filers
router.get('/leaderboard', async (req, res) => {
  try {
    const topFilers = await User.find({ karmaPoints: { $gt: 0 } })
      .sort({ karmaPoints: -1 })
      .limit(10)
      .select('handle karmaTier karmaPoints badges state');

    res.json({ success: true, leaderboard: topFilers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
