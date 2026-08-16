const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const PSEUDO_PREFIXES = [
  'AngryAloo', 'ChaiPeCharcha', 'DeshBhaktNagrik', 'RtiWarrior', 'JantaKaBoss',
  'PotholeHunter', 'VikasSeeker', 'SunoNetaJi', 'LokPalJury', 'KisanAwaaz',
  'TaxPayerSher', 'GullyReporter', 'BhrashtKaKaal', 'AuditOfficer', 'AwaazUthao'
];

function generateHandle() {
  const prefix = PSEUDO_PREFIXES[Math.floor(Math.random() * PSEUDO_PREFIXES.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}_${randomNum}`;
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'janaudit_super_secret_civic_key_2026_jwt_token_auth', {
    expiresIn: '30d',
  });
};

// @route GET /api/auth/check-username
// @desc Real-time check for handle/username availability with intelligent suggestions
router.get('/check-username', async (req, res) => {
  try {
    const rawHandle = (req.query.handle || '').trim();

    if (!rawHandle || rawHandle.length < 3) {
      return res.json({
        success: true,
        available: false,
        message: 'Username must be at least 3 characters.',
        suggestions: [],
      });
    }

    // Clean username (alphanumeric and underscores)
    const sanitized = rawHandle.replace(/[^a-zA-Z0-9_]/g, '');

    // Check exact case-insensitive match
    const existing = await User.findOne({
      handle: { $regex: new RegExp(`^${sanitized}$`, 'i') },
    });

    if (!existing) {
      return res.json({
        success: true,
        available: true,
        handle: sanitized,
        message: 'Username is available',
        suggestions: [],
      });
    }

    // Username is taken -> Generate smart suggestions using the user's input
    const candidateSuffixes = ['_audit', '_nagrik', '_in', '_official', '_voice'];
    const candidates = [];

    // Strategy 1: User input + random 3-digit number
    candidates.push(`${sanitized}${Math.floor(100 + Math.random() * 900)}`);
    candidates.push(`${sanitized}_${Math.floor(10 + Math.random() * 90)}`);

    // Strategy 2: User input + suffix
    for (const sfx of candidateSuffixes) {
      candidates.push(`${sanitized}${sfx}`);
    }

    // Strategy 3: Prefix + user input
    candidates.push(`the_${sanitized}`);
    candidates.push(`real_${sanitized}`);

    // Verify all candidates in database in parallel and pick top 4 available
    const availableSuggestions = [];
    for (const candidate of candidates) {
      if (availableSuggestions.length >= 4) break;
      const found = await User.findOne({
        handle: { $regex: new RegExp(`^${candidate}$`, 'i') },
      });
      if (!found && !availableSuggestions.includes(candidate)) {
        availableSuggestions.push(candidate);
      }
    }

    return res.json({
      success: true,
      available: false,
      handle: sanitized,
      message: 'Username is already taken',
      suggestions: availableSuggestions,
    });
  } catch (err) {
    console.error('Check username error:', err);
    res.status(500).json({ success: false, message: 'Error checking username availability' });
  }
});

// @route POST /api/auth/signup
// @desc Register user and send 24h Email Verification Link
router.post('/signup', async (req, res) => {
  try {
    const {
      fullName,
      handle,
      email,
      password,
      role = 'citizen',
      constituency = 'New Delhi',
      state = 'Delhi',
      credentialsDoc = '',
    } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const assignedRole = ['citizen', 'representative', 'moderator'].includes(role) ? role : 'citizen';
    const finalEmail = email.trim().toLowerCase();

    // Check if email is already registered
    const existingEmail = await User.findOne({ email: finalEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in or reset your password.',
      });
    }

    // Determine or generate unique handle
    let chosenHandle = handle ? handle.trim().replace(/[^a-zA-Z0-9_]/g, '') : generateHandle();
    const handleExists = await User.findOne({
      handle: { $regex: new RegExp(`^${chosenHandle}$`, 'i') },
    });
    if (handleExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose another username.',
      });
    }

    // Generate cryptographic 24-hour verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName || '',
      handle: chosenHandle,
      email: finalEmail,
      password: hashedPassword,
      role: assignedRole,
      isEmailVerified: false,
      verificationStatus: 'PENDING_EMAIL_VERIFICATION',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpires,
      credentialsDoc: credentialsDoc || '',
      constituency,
      state,
      karmaPoints: 50,
      jantaPoints: 100,
      karmaTier: 'nagrik',
      badges: [
        {
          id: 'democray_pioneer',
          name: 'Democracy Pioneer',
          icon: '🗳️',
          description: 'Joined the JanAudit civic accountability movement',
        },
      ],
    });

    // Send verification email
    await sendVerificationEmail({
      email: finalEmail,
      handle: chosenHandle,
      token: verificationToken,
    });

    res.status(201).json({
      success: true,
      message: `Registration successful! We have sent a verification link to ${finalEmail}.`,
      userId: user._id,
      email: user.email,
      handle: user.handle,
      role: user.role,
      verificationStatus: user.verificationStatus,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
});

// @route POST /api/auth/verify-email
// @desc Verify account using cryptographic email link token
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired. Please request a new verification link.',
      });
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // Role-specific verification tiering
    if (user.role === 'citizen') {
      user.verificationStatus = 'VERIFIED';
    } else if (user.role === 'representative' || user.role === 'moderator') {
      user.verificationStatus = 'PENDING_ADMIN_VERIFICATION';
    } else if (user.role === 'superadmin') {
      user.verificationStatus = 'VERIFIED';
    }

    await user.save();

    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: user.role === 'citizen'
        ? 'Email verified successfully! Full citizen access activated.'
        : `Email verified! Your ${user.role} credential application is awaiting Lokpal Admin approval.`,
      token: authToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        handle: user.handle,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        verificationStatus: user.verificationStatus,
        credentialsDoc: user.credentialsDoc,
        karmaTier: user.karmaTier,
        karmaPoints: user.karmaPoints,
        jantaPoints: user.jantaPoints,
        votingPower: user.votingPower,
        constituency: user.constituency,
        state: user.state,
        badges: user.badges,
        verifiedNagrik: user.verifiedNagrik,
      },
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, message: 'Server error during email verification', error: err.message });
  }
});

// @route POST /api/auth/resend-verification
// @desc Resend account verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'This email is already verified. Please log in.' });
    }

    // Generate new token with fresh 24h expiration
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail({
      email: user.email,
      handle: user.handle,
      token: verificationToken,
    });

    res.json({
      success: true,
      message: `A fresh verification link has been sent to ${user.email}.`,
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ success: false, message: 'Error resending verification link' });
  }
});

// @route POST /api/auth/forgot-password
// @desc Request secure password reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { handle: email.trim() },
      ],
    });

    // For privacy, return generic response even if email does not exist
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
      await user.save();

      await sendPasswordResetEmail({
        email: user.email,
        handle: user.handle,
        token: resetToken,
      });
    }

    res.json({
      success: true,
      message: 'If an account exists with that email address, password reset instructions have been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Error processing password reset request' });
  }
});

// @route POST /api/auth/reset-password
// @desc Reset password using cryptographic token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Your password has been reset successfully!',
      token: authToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        handle: user.handle,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus || 'VERIFIED',
      },
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

// @route POST /api/auth/login
// @desc Login with Email or Handle + Password
router.post('/login', async (req, res) => {
  try {
    const { identifier, handle, email, password } = req.body;
    const loginId = (identifier || handle || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Email or username and password are required.' });
    }

    const user = await User.findOne({
      $or: [
        { handle: loginId },
        { email: loginId.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your username and password.' });
    }

    if (user.isLocked) {
      return res.status(403).json({ success: false, message: 'Your account has been locked by Lokpal Super Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    // Update daily streak
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate || now);
    const dayDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) {
      user.dailyStreak = (user.dailyStreak || 1) + 1;
      user.jantaPoints = (user.jantaPoints || 100) + 15;
    }
    user.lastActiveDate = now;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        handle: user.handle,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        verificationStatus: user.verificationStatus || 'VERIFIED',
        credentialsDoc: user.credentialsDoc,
        karmaTier: user.karmaTier,
        karmaPoints: user.karmaPoints,
        jantaPoints: user.jantaPoints,
        votingPower: user.votingPower,
        constituency: user.constituency,
        state: user.state,
        badges: user.badges,
        dailyStreak: user.dailyStreak,
        verifiedNagrik: user.verifiedNagrik,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
});

// @route GET /api/auth/me
// @desc Get current authenticated user profile
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route POST /api/auth/verify-nagrik-upi
// @desc Simulate ₹11 UPI micro-donation for verified trust signal
router.post('/verify-nagrik-upi', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.verifiedNagrik = true;
    user.karmaPoints += 150;
    user.jantaPoints += 300;
    user.updateKarmaTier();

    user.badges.push({
      id: 'verified_nagrik',
      name: 'Verified Nagrik',
      icon: '🛡️',
      description: 'Micro-verified authentic Indian citizen contributor',
    });

    await user.save();
    res.json({
      success: true,
      message: '₹11 Verified Nagrik badge successfully activated!',
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Backward compatibility alias for legacy /register route
router.post('/register', (req, res, next) => {
  req.url = '/signup';
  router.handle(req, res, next);
});

module.exports = router;
