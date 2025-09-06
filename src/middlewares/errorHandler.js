import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, _next) => {
  // 1) Mongo duplicate key (ör: email unique)
  if ((err?.code === 11000) || (err?.name === 'MongoServerError' && err?.code === 11000)) {
    return res.status(409).json({ status: 409, message: 'Email in use' });
  }

  // 2) Mongoose doğrulama
  if (err?.name === 'ValidationError') {
    const errors = Object.values(err.errors ?? {}).map(e => ({
      path: e.path,
      message: e.message,
    }));
    return res.status(400).json({ status: 400, message: 'Validation error', errors });
  }

  // 3) Geçersiz ObjectId
  if (err?.name === 'CastError' && err?.kind === 'ObjectId') {
    return res.status(400).json({ status: 400, message: 'Invalid id format' });
  }

  // 4) JWT hataları
  if (err?.name === 'TokenExpiredError') {
    return res.status(401).json({ status: 401, message: 'Access token expired' });
  }
  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({ status: 401, message: 'Unauthorized' });
  }

  // 5) http-errors ile oluşturulanlar
  if (isHttpError(err)) {
    const status = err.status ?? 500;
    return res.status(status).json({ status, message: err.message });
  }

  // 6) Bilinmeyen hatalar
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Error:', err);
  }
  return res.status(500).json({ status: 500, message: 'Internal Server Error' });
};
