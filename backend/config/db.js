const mongoose = require('mongoose');

let isDbConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academic_portal';

  try {
    // Attempt Mongoose connection with short timeout so server does not hang
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });

    isDbConnected = true;
    console.log(`\x1b[32m✔ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}\x1b[0m`);
  } catch (error) {
    isDbConnected = false;
    console.log(`\x1b[33m⚠ MongoDB Local Service not reachable (${error.message}).\x1b[0m`);
    console.log(`\x1b[36mℹ Project is running with Built-in Resilient Storage so you can test all Unit 1-5 APIs immediately!\x1b[0m`);
    console.log(`\x1b[36mℹ To use MongoDB Atlas, simply paste your connection string in backend/.env: MONGO_URI=...\x1b[0m`);
  }
};

const getDbStatus = () => ({
  connected: isDbConnected,
  host: isDbConnected ? mongoose.connection.host : 'Memory/JSON Mock Active',
  database: isDbConnected ? mongoose.connection.name : 'academic_portal_fallback',
  uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academic_portal'
});

module.exports = { connectDB, getDbStatus };
