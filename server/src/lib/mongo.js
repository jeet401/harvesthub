const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  return mongoose.connection;
}

module.exports = { connectToDatabase };


