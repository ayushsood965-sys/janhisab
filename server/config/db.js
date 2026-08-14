const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janhisab';
  
  try {
    console.log(`📡 Connecting to MongoDB at ${uri}...`);
    // Set a quick 3s timeout for local MongoDB check
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}). Initializing In-Memory MongoDB Server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      console.log(`🚀 In-Memory MongoDB Server started at: ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log('✅ Connected to In-Memory MongoDB successfully.');
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB Server:', memErr.message);
      process.exit(1);
    }
  }

  // Hook into connection events
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, closeDB };
