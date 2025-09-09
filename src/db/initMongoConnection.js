import mongoose from 'mongoose';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';

export const initMongoDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    // Öncelik: tek satır URI varsa onu kullan
    const inlineUri = process.env.MONGODB_URI;

    let uri = inlineUri;
    if (!uri) {
      const user = getEnvVar(ENV_VARS.MONGODB_USER);
      const pwd  = getEnvVar(ENV_VARS.MONGODB_PASSWORD);
      const url  = getEnvVar(ENV_VARS.MONGODB_URL);
      const db   = getEnvVar(ENV_VARS.MONGODB_DB);

      uri = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pwd)}@${url}/${db}?retryWrites=true&w=majority`;
    }

    await mongoose.connect(uri /* , { serverSelectionTimeoutMS: 10000 } */);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.log('Error while setting up mongo connection', error);
    throw error;
  }
};
