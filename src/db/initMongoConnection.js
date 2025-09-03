import mongoose from 'mongoose';
import { env } from '../utils/env.js';

const initMongoConnection = async () => {
  const MONGODB_USER = env('MONGO_USER');
  const MONGODB_PASSWORD = env('MONGO_PASSWORD');
  const MONGODB_URL = env('MONGO_URL');
  const MONGODB_DB = env('MONGO_DB');
  const mongoUri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  const options = {
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000, 
  };
  try {
    await mongoose.connect(mongoUri, options);
    console.log('\n✅ | Mongo connection successfully established!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default initMongoConnection;