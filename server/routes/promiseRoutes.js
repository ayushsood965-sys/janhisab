const express = require('express');
const router = express.Router();
const PromiseModel = require('../models/Promise');
const Politician = require('../models/Politician');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @route GET /api/promises
// @desc Get promises with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category, politicianId, hasSlider, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (politicianId) filter.politician = politicianId;
    if (hasSlider === 'true') filter['promiseVsReality.hasSlider'] = true;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { politicianName: { $regex: search, $options: 'i' } },
      ];
    }

    const promises = await PromiseModel.find(filter)
      .populate('politician', 'name photo party constituency state impactScore')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: promises.length,
      promises,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/promises/sliders
// @desc Get all Promise vs Reality interactive image sliders
router.get('/sliders', async (req, res) => {
  try {
    const sliders = await PromiseModel.find({ 'promiseVsReality.hasSlider': true })
      .populate('politician', 'name photo party constituency state')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      sliders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/promises/:id
// @desc Get single promise details and timeline
router.get('/:id', async (req, res) => {
  try {
    const promise = await PromiseModel.findById(req.params.id)
      .populate('politician', 'name photo party constituency state impactScore');

    if (!promise) {
      return res.status(404).json({ success: false, message: 'Promise record not found' });
    }

    res.json({
      success: true,
      promise,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/promises/:id/evidence
// @desc Submit citizen proof on promise status
router.post('/:id/evidence', protect, async (req, res) => {
  try {
    const { title, description, evidenceUrl, suggestedStatus } = req.body;
    const promise = await PromiseModel.findById(req.params.id);

    if (!promise) {
      return res.status(404).json({ success: false, message: 'Promise record not found' });
    }

    promise.timeline.push({
      date: new Date(),
      title: title || 'Citizen Ground Evidence Submitted',
      description,
      evidenceUrl: evidenceUrl || '',
      sourceType: 'Citizen Ground Report',
      statusTag: suggestedStatus || promise.status,
    });

    promise.communityEvidenceCount += 1;
    // Reward user
    const user = await User.findById(req.user._id);
    user.jantaPoints += 20;
    user.karmaPoints += 10;
    promise.communityEvidenceCount += 1;
    await promise.save();

    res.json({
      success: true,
      message: 'Evidence timeline entry appended successfully.',
      timeline: promise.timeline,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/promises
// @desc Create new manifesto promise (representative / admin)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, targetDate, politicianId, politicianName, completionPercentage = 0 } = req.body;
    const promise = await PromiseModel.create({
      title,
      description,
      category: category || 'Infrastructure',
      targetDate: targetDate ? new Date(targetDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      politician: politicianId,
      politicianName: politicianName || 'Elected Representative',
      completionPercentage,
      status: completionPercentage >= 100 ? 'delivered' : completionPercentage > 0 ? 'in_progress' : 'unfulfilled',
    });

    res.status(201).json({ success: true, message: 'Manifesto promise created successfully', promise });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/promises/:id
// @desc Update manifesto promise details and progress % (representative / admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const promise = await PromiseModel.findById(req.params.id);
    if (!promise) return res.status(404).json({ success: false, message: 'Promise not found' });

    const { title, description, category, completionPercentage, status, targetDate } = req.body;
    if (title) promise.title = title;
    if (description) promise.description = description;
    if (category) promise.category = category;
    if (completionPercentage !== undefined) {
      promise.completionPercentage = Number(completionPercentage);
      if (promise.completionPercentage >= 100) promise.status = 'delivered';
      else if (promise.completionPercentage > 0) promise.status = 'in_progress';
      else promise.status = 'unfulfilled';
    }
    if (status) promise.status = status;
    if (targetDate) promise.targetDate = new Date(targetDate);

    await promise.save();
    res.json({ success: true, message: 'Promise updated successfully', promise });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/promises/:id
// @desc Delete manifesto promise
router.delete('/:id', protect, async (req, res) => {
  try {
    const promise = await PromiseModel.findById(req.params.id);
    if (!promise) return res.status(404).json({ success: false, message: 'Promise not found' });

    await PromiseModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Promise deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
