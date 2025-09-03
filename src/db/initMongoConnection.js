import mongoose from 'mongoose';
import { env } from '../utils/env.js';

const initMongoConnection = async () => {
  const MONGODB_USER = env('MONGODB_USER');
  const MONGODB_PASSWORD = env('MONGODB_PASSWORD');
  const MONGODB_URL = env('MONGODB_URL'); // örn: cluster0.xxxxx.mongodb.net
  const MONGODB_DB = env('MONGODB_DB');   // örn: contactsdb

  const mongoUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(mongoUri, {
      dbName: MONGODB_DB,                 // ✅ güvenli DB seçimi
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connection established to DB: ${MONGODB_DB}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
};

export default initMongoConnection;
