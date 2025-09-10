import { v2 as cloudinary } from 'cloudinary';
import { getEnvVar } from '../utils/getEnvVar.js';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  api_key: getEnvVar('CLOUDINARY_API_KEY'),
  api_secret: getEnvVar('CLOUDINARY_API_SECRET'),
});

const DEFAULT_FOLDER = process.env.CLOUDINARY_FOLDER || 'contacts';

export async function uploadBufferToCloudinary(buffer, folder = DEFAULT_FOLDER) {
  if (!buffer) return null;
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result?.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(upload);
  });
}
