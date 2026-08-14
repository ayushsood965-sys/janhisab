const express = require('express');
const router = express.Router();
const CmsConfig = require('../models/CmsConfig');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Ensure default CMS config exists
async function getOrCreateConfig() {
  let config = await CmsConfig.findOne({ configKey: 'global_cms_config' });
  if (!config) {
    config = await CmsConfig.create({
      configKey: 'global_cms_config',
      formulaWeights: {
        objectiveDataWeight: 0.45,
        verifiedOutcomesWeight: 0.25,
        communitySentimentWeight: 0.20,
        trustRecencyWeight: 0.10,
      },
      auditLogs: [
        {
          adminHandle: 'System Initializer',
          action: 'CMS Initialization',
          details: 'Default 4-Pillar Impact Score formula loaded (45% data, 25% outcomes, 20% sentiment, 10% recency)',
          timestamp: new Date(),
        },
      ],
    });
  }
  return config;
}

// @route GET /api/cms/config
// @desc Get CMS configuration
router.get('/config', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/cms/weights
// @desc Dynamically tune formula weights (Super Admin only or dev)
router.put('/weights', protect, async (req, res) => {
  try {
    const { objectiveDataWeight, verifiedOutcomesWeight, communitySentimentWeight, trustRecencyWeight } = req.body;
    const config = await getOrCreateConfig();

    config.formulaWeights = {
      objectiveDataWeight: Number(objectiveDataWeight) || 0.45,
      verifiedOutcomesWeight: Number(verifiedOutcomesWeight) || 0.25,
      communitySentimentWeight: Number(communitySentimentWeight) || 0.20,
      trustRecencyWeight: Number(trustRecencyWeight) || 0.10,
    };

    config.auditLogs.unshift({
      adminHandle: req.user.handle,
      action: 'UPDATE_FORMULA_WEIGHTS',
      details: `Weights updated to: Data ${(config.formulaWeights.objectiveDataWeight * 100)}%, Outcomes ${(config.formulaWeights.verifiedOutcomesWeight * 100)}%, Sentiment ${(config.formulaWeights.communitySentimentWeight * 100)}%, Recency ${(config.formulaWeights.trustRecencyWeight * 100)}%`,
      timestamp: new Date(),
    });

    await config.save();

    res.json({
      success: true,
      message: 'Impact Score formula weights dynamically adjusted in real-time!',
      formulaWeights: config.formulaWeights,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/cms/modules
// @desc Toggle decoupled modules on/off
router.put('/modules', protect, async (req, res) => {
  try {
    const { modules } = req.body;
    const config = await getOrCreateConfig();

    config.modules = { ...config.modules.toObject(), ...modules };
    config.auditLogs.unshift({
      adminHandle: req.user.handle,
      action: 'TOGGLE_MODULES',
      details: 'Modular CMS features reconfigured',
      timestamp: new Date(),
    });

    await config.save();

    res.json({
      success: true,
      message: 'Module states updated successfully!',
      modules: config.modules,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/cms/announcement
// @desc Update announcement banner
router.put('/announcement', protect, async (req, res) => {
  try {
    const { enabled, text, link, badge } = req.body;
    const config = await getOrCreateConfig();

    config.announcement = {
      enabled: enabled !== undefined ? enabled : config.announcement.enabled,
      text: text || config.announcement.text,
      link: link || config.announcement.link,
      badge: badge || config.announcement.badge,
    };

    await config.save();
    res.json({ success: true, announcement: config.announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
