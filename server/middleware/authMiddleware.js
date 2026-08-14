const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect route - requires valid JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Pseudonymous token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'janhisab_super_secret_civic_key_2026_jwt_token_auth');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Optional auth - allows zero-signup browsing while attaching user if token present
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'janhisab_super_secret_civic_key_2026_jwt_token_auth');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore error for optional auth
    }
  }
  next();
};

// Granular RBAC Role Check
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, requireRole };
