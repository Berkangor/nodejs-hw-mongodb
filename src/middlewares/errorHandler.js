import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, _next) => {
  // 1) http-errors ile oluşturulan hatalar: özel mesajları koru
  if (isHttpError(err)) {
    const status = err.status ?? 500;
    return res.status(status).json({ status, message: err.message, data: {} });
  }

  // 2) Mongo duplicate key (email unique)
  if (err?.code === 11000 || (err?.name === 'MongoServerError' && err?.code === 11000)) {
    return res.status(409).json({ status: 409, message: 'Email in use', data: {} });
  }

  // 3) Mongoose validation
  if (err?.name === 'ValidationError') {
    const errors = Object.values(err.errors ?? {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return res.status(400).json({ status: 400, message: 'Validation error', errors, data: {} });
  }

  // 4) Geçersiz ObjectId
  if (err?.name === 'CastError' && (err?.kind === 'ObjectId' || err?.path === '_id')) {
    return res.status(400).json({ status: 400, message: 'Invalid id format', data: {} });
  }

  // 5) JWT kütüphane hataları (controller özel mesajı yoksa)
  if (err?.name === 'TokenExpiredError') {
    return res.status(401).json({ status: 401, message: 'Access token expired', data: {} });
  }
  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({ status: 401, message: 'Unauthorized', data: {} });
  }

  // 6) Multer (upload) limitleri
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ status: 400, message: 'File too large', data: {} });
  }

  // 7) Fallback
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Error:', err);
  }
  return res.status(500).json({ status: 500, message: 'Internal Server Error', data: {} });
};
