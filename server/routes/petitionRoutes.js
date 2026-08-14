const express = require('express');
const router = express.Router();
const Petition = require('../models/Petition');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @route GET /api/petitions
// @desc Get petitions list
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'All') filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { targetDepartment: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Petition.countDocuments(filter);
    const petitions = await Petition.find(filter)
      .populate('targetPoliticians', 'name photo party constituency state')
      .sort({ currentSignatures: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      petitions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/petitions/:id
// @desc Get single petition details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id)
      .populate('targetPoliticians', 'name photo party constituency state impactScore');

    if (!petition) return res.status(404).json({ success: false, message: 'Petition not found' });

    let hasSigned = false;
    if (req.user) {
      hasSigned = petition.signatures.some((s) => s.user.toString() === req.user._id.toString());
    }

    res.json({ success: true, petition, hasSigned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/petitions
// @desc Create new civic petition
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetPoliticians = [],
      targetDepartment,
      targetOfficialDesignation,
      targetAuthority,
      targetSignatures,
      signatureGoal = 1000,
      state,
      constituency,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const user = await User.findById(req.user._id);

    const petition = await Petition.create({
      creator: user._id,
      creatorHandle: user.handle,
      title,
      description,
      category: category || 'Civic Infrastructure',
      targetPoliticians,
      targetDepartment: targetDepartment || targetAuthority || 'Public Works & Governance',
      targetOfficialDesignation: targetOfficialDesignation || 'Concerned Authority',
      targetAuthority: targetAuthority || targetDepartment || 'Public Works Department',
      targetSignatures: Number(targetSignatures || signatureGoal) || 1000,
      signatureGoal: Number(targetSignatures || signatureGoal) || 1000,
      state: state || user.state || 'National',
      constituency: constituency || user.constituency || 'General',
      currentSignatures: 1,
      signaturesCount: 1,
      signatures: [
        {
          user: user._id,
          handle: user.handle,
          comment: 'Initiated petition for public accountability.',
          signedAt: new Date(),
        },
      ],
    });

    user.jantaPoints += 30;
    user.karmaPoints += 20;
    user.updateKarmaTier();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Petition launched successfully!',
      petition,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/petitions/:id
// @desc Update petition (author or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ success: false, message: 'Petition not found' });

    if (petition.creator?.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this petition' });
    }

    const { title, description, category, targetAuthority, signatureGoal, targetSignatures } = req.body;
    if (title) petition.title = title;
    if (description) petition.description = description;
    if (category) petition.category = category;
    if (targetAuthority) petition.targetAuthority = targetAuthority;
    if (signatureGoal || targetSignatures) {
      petition.signatureGoal = Number(signatureGoal || targetSignatures);
      petition.targetSignatures = Number(signatureGoal || targetSignatures);
    }

    await petition.save();
    res.json({ success: true, message: 'Petition updated successfully', petition });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/petitions/:id
// @desc Delete/Withdraw petition (author or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ success: false, message: 'Petition not found' });

    if (petition.creator?.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this petition' });
    }

    await Petition.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Petition withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/petitions/:id/sign
// @desc Sign petition (1 verified signature per user)
router.post('/:id/sign', protect, async (req, res) => {
  try {
    const { comment } = req.body;
    const petition = await Petition.findById(req.params.id);

    if (!petition) return res.status(404).json({ success: false, message: 'Petition not found' });

    const alreadySigned = petition.signatures.some((s) => s.user?.toString() === req.user._id.toString());
    if (alreadySigned) {
      return res.status(400).json({ success: false, message: 'You have already signed this petition.' });
    }

    petition.signatures.push({
      user: req.user._id,
      handle: req.user.handle,
      comment: comment || 'Signed in public interest',
      signedAt: new Date(),
    });

    petition.currentSignatures += 1;
    petition.signaturesCount = petition.currentSignatures;

    // Check milestones
    if (petition.currentSignatures >= 100 && petition.milestoneReached < 100) {
      petition.milestoneReached = 100;
      petition.status = 'milestone_reached';
    } else if (petition.currentSignatures >= 1000 && petition.milestoneReached < 1000) {
      petition.milestoneReached = 1000;
      petition.status = 'notice_dispatched';
      petition.noticeDispatchedAt = new Date();
    }

    await petition.save();

    // Reward user
    const user = await User.findById(req.user._id);
    user.jantaPoints += 10;
    user.karmaPoints += 5;
    await user.save();

    res.json({
      success: true,
      message: 'Signature recorded successfully!',
      currentSignatures: petition.currentSignatures,
      milestoneReached: petition.milestoneReached,
      status: petition.status,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
