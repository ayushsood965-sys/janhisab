const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { stripExifAndSanitizeImage } = require('../services/exifService');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `upload_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});

// Middleware that sanitizes EXIF after upload
const sanitizeUpload = async (req, res, next) => {
  if (req.file && req.file.path) {
    const ext = path.extname(req.file.path).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      try {
        await stripExifAndSanitizeImage(req.file.path);
      } catch (err) {
        console.warn('Sanitize upload error:', err.message);
      }
    }
  }
  next();
};

module.exports = { upload, sanitizeUpload };
