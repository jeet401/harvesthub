// Script to clear all users and profiles from MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmbyte';

async function clearData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;

    // Delete all users
    const usersResult = await db.collection('users').deleteMany({});
    console.log(`🗑️  Deleted ${usersResult.deletedCount} users`);

    // Delete all profiles
    const profilesResult = await db.collection('profiles').deleteMany({});
    console.log(`🗑️  Deleted ${profilesResult.deletedCount} profiles`);

    console.log('✅ Successfully cleared all users and profiles!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearData();
