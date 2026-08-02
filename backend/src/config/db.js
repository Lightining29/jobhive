const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is not configured');
  }
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
