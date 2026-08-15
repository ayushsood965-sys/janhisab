const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

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

function hashIdentifier(rawPhone) {
  return crypto.createHash('sha256').update(rawPhone || 'generic_device_id_' + Date.now()).digest('hex');
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'janaudit_super_secret_civic_key_2026_jwt_token_auth', {
    expiresIn: '30d',
  });
};

// @route POST /api/auth/signup
// @desc Unified Role Registration with 6-digit Email OTP generation
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

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const assignedRole = ['citizen', 'representative', 'moderator'].includes(role) ? role : 'citizen';
    const finalEmail = email ? email.trim().toLowerCase() : `anon_${Date.now()}@janaudit.org`;

    // Check if email already registered
    const existingEmail = await User.findOne({ email: finalEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    // Determine or generate unique handle
    let chosenHandle = handle ? handle.trim() : generateHandle();
    const handleExists = await User.findOne({ handle: chosenHandle });
    if (handleExists) {
      chosenHandle = `${chosenHandle}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // Generate 6-digit OTP code (Simulated Email Dispatch)
    const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName || '',
      handle: chosenHandle,
      email: finalEmail,
      password: hashedPassword,
      role: assignedRole,
      verificationStatus: 'PENDING_EMAIL_VERIFICATION',
      emailOtp: simulatedOtp,
      emailOtpExpires: otpExpires,
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

    res.status(201).json({
      success: true,
      message: `Registration successful. 6-digit OTP verification code sent to ${finalEmail}.`,
      otp: simulatedOtp, // Provided for instant simulation and seamless testing
      userId: user._id,
      email: user.email,
      handle: user.handle,
      role: user.role,
      verificationStatus: user.verificationStatus,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup', error: err.message });
  }
});

// @route POST /api/auth/verify-email
// @desc Verify 6-digit email OTP and execute 2-tier role verification
router.post('/verify-email', async (req, res) => {
  try {
    const { email, handle, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP verification code is required' });
    }

    const query = {};
    if (email) query.email = email.trim().toLowerCase();
    else if (handle) query.handle = handle.trim();
    else {
      return res.status(400).json({ success: false, message: 'Email or handle is required' });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check OTP match (allow '123456' as master universal dev bypass code)
    const isOtpValid = (user.emailOtp && user.emailOtp === otp.trim()) || otp.trim() === '123456';
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP code' });
    }

    // Tier 2: Role Verification Logic
    if (user.role === 'citizen') {
      user.verificationStatus = 'VERIFIED';
    } else if (user.role === 'representative' || user.role === 'moderator') {
      user.verificationStatus = 'PENDING_ADMIN_VERIFICATION';
    } else if (user.role === 'superadmin') {
      user.verificationStatus = 'VERIFIED';
    }

    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: user.role === 'citizen'
        ? 'Email verified! Full Citizen access unlocked.'
        : `Email verified! Your ${user.role} role application is submitted and awaiting Super Admin approval.`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        handle: user.handle,
        email: user.email,
        role: user.role,
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

// @route POST /api/auth/login
// @desc Login with Email or Handle + Password with role verification checks
router.post('/login', async (req, res) => {
  try {
    const { identifier, handle, email, password } = req.body;
    const loginId = (identifier || handle || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Email/Handle and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { handle: loginId },
        { email: loginId.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (user.isLocked) {
      return res.status(403).json({ success: false, message: 'Your account has been locked by Lokpal Super Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Update streak if active on a new day
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate || now);
    const dayDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) {
      user.dailyStreak += 1;
      user.jantaPoints += 15;
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
