import mongoose from 'mongoose';
import { env } from '../utils/env.js';

const initMongoConnection = async () => {
  const MONGO_USER = env('MONGO_USER');
  const MONGO_PASSWORD = env('MONGO_PASSWORD');
  const MONGO_URL = env('MONGO_URL');
  const MONGO_DB = env('MONGO_DB');
  const mongoUri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_URL}/${MONGO_DB}?retryWrites=true&w=majority`;

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