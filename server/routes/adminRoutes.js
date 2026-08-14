const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Politician = require('../models/Politician');
const CmsConfig = require('../models/CmsConfig');
const { protect } = require('../middleware/authMiddleware');

// Middleware to restrict access to superadmin or moderator
const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'superadmin' || req.user.role === 'moderator')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied. Super Admin privileges required.' });
};

// @route GET /api/admin/pending-verifications
// @desc Get all Representative and Moderator applications awaiting Super Admin approval
router.get('/pending-verifications', protect, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({
      verificationStatus: 'PENDING_ADMIN_VERIFICATION',
    }).select('-password -emailOtp').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingUsers.length,
      pendingUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/admin/verify-user
// @desc Approve or Reject a user role application
router.post('/verify-user', protect, requireAdmin, async (req, res) => {
  try {
    const { targetUserId, action, notes } = req.body;

    if (!targetUserId || !action) {
      return res.status(400).json({ success: false, message: 'Target user ID and action are required' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'APPROVE') {
      user.verificationStatus = 'VERIFIED';
      user.karmaPoints += 500; // Approval bonus
      user.updateKarmaTier();
    } else if (action === 'REJECT') {
      user.verificationStatus = 'REJECTED';
    } else {
      return res.status(400).json({ success: false, message: "Action must be 'APPROVE' or 'REJECT'" });
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.handle} role application has been ${action === 'APPROVE' ? 'Approved & Verified' : 'Rejected'}.`,
      user: {
        id: user._id,
        handle: user.handle,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/admin/users
// @desc Get list of all users with search and role filters
router.get('/users', protect, requireAdmin, async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.verificationStatus = status;
    if (search) {
      query.$or = [
        { handle: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { constituency: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -emailOtp')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/admin/users/:id/role
// @desc Directly change user role
router.post('/users/:id/role', protect, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['citizen', 'representative', 'moderator', 'superadmin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    if (role === 'superadmin' || role === 'citizen') {
      user.verificationStatus = 'VERIFIED';
    }
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/admin/users/:id/toggle-lock
// @desc Lock or unlock user account
router.post('/users/:id/toggle-lock', protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isLocked = !user.isLocked;
    await user.save();

    res.json({
      success: true,
      message: user.isLocked ? 'User account has been locked' : 'User account unlocked',
      isLocked: user.isLocked,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/admin/audit-logs
// @desc Get simulated platform security and moderation audit logs
router.get('/audit-logs', protect, requireAdmin, async (req, res) => {
  try {
    const logs = [
      {
        id: 'log_1',
        action: 'ROLE_VERIFICATION',
        description: 'SuperAdmin approved Representative credentials for MP_VikasKumar',
        actor: 'SuperAdmin_Nagrik',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'SUCCESS',
      },
      {
        id: 'log_2',
        action: 'ALGORITHM_TUNING',
        description: 'Updated Attendance Weight from 25% to 30%',
        actor: 'SuperAdmin_Nagrik',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        status: 'SUCCESS',
      },
      {
        id: 'log_3',
        action: 'EVIDENCE_UPGRADE',
        description: 'Moderator upgraded Post #PWD-Road-2026 from Likely to Verified (Seal of Janta)',
        actor: 'LokpalJury_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
        status: 'SUCCESS',
      },
      {
        id: 'log_4',
        action: 'BOT_QUARANTINE',
        description: 'Anti-Brigading heuristic automatically quarantined 12 rapid sentiment votes from single IP block',
        actor: 'SYSTEM_BOT_SHIELD',
        timestamp: new Date(Date.now() - 1000 * 60 * 480),
        status: 'FLAGGED',
      },
    ];

    res.json({
      success: true,
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
