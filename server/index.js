const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { connectDB } = require('./config/db');
const { setupSocketIO } = require('./services/socketService');
const { seedDatabase } = require('./seed/seedData');
const Politician = require('./models/Politician');

// Initialize Express & HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupSocketIO(io);

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import API routes
const authRoutes = require('./routes/authRoutes');
const politicianRoutes = require('./routes/politicianRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const postRoutes = require('./routes/postRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const promiseRoutes = require('./routes/promiseRoutes');
const rtiRoutes = require('./routes/rtiRoutes');
const petitionRoutes = require('./routes/petitionRoutes');
const constituencyRoutes = require('./routes/constituencyRoutes');
const memeRoutes = require('./routes/memeRoutes');
const jukeboxRoutes = require('./routes/jukeboxRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const netaCardRoutes = require('./routes/netaCardRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const andolanRoutes = require('./routes/andolanRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/politicians', politicianRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/promises', promiseRoutes);
app.use('/api/rtis', rtiRoutes);
app.use('/api/rti', rtiRoutes);
app.use('/api/petitions', petitionRoutes);
app.use('/api/constituencies', constituencyRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/jukebox', jukeboxRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/neta-cards', netaCardRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/andolan', andolanRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cms', cmsRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'JanHisab (JanAudit) Civic Accountability Platform',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Process-level safety guards
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Server Initialization with Auto-Seed check
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Check if DB is empty, if so auto-seed for instant turnkey experience
  try {
    const count = await Politician.countDocuments();
    if (count === 0) {
      console.log('📦 Database is empty. Running initial turnkey seed...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 JanHisab API Server running on port ${PORT}`);
    console.log(`📡 Real-time Socket.io active on ws://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Failed to initialize server:', err);
});

module.exports = { app, server };
