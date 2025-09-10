import multer from 'multer';
import createHttpError from 'http-errors';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(createHttpError(400, 'Only JPG/PNG/WEBP images are allowed'));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
