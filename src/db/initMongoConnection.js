import mongoose, { version } from 'mongoose';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';

// const clientOptions = { version: '1', strict: true, deprecationErrors: true };

export const initMongoDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const user = getEnvVar(ENV_VARS.MONGODB_USER);
    const pwd = getEnvVar(ENV_VARS.MONGODB_PASSWORD);
    const url = getEnvVar(ENV_VARS.MONGODB_URL);
    const db = getEnvVar(ENV_VARS.MONGODB_DB);

    const uri = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`;
    await mongoose.connect(
      uri,
      // clientOptions
    );

    // const url = getEnvVar('DB_HOST');
    // await mongoose.connect(url);

    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.log('Error while setting up mongo connection', error);
    throw error;
  }
};
