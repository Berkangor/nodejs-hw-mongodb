import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, _next) => {
  // Duplicate key (email unique)
  if ((err?.code === 11000) || (err?.name === 'MongoServerError' && err?.code === 11000)) {
    return res.status(409).json({ status: 409, message: 'Email in use' });
  }

  // Mongoose validation
  if (err?.name === 'ValidationError') {
    const errors = Object.values(err.errors ?? {}).map(e => ({
      path: e.path,
      message: e.message,
    }));
    return res.status(400).json({ status: 400, message: 'Validation error', errors });
  }

  // Invalid ObjectId
  if (err?.name === 'CastError' && err?.kind === 'ObjectId') {
    return res.status(400).json({ status: 400, message: 'Invalid id format' });
  }

  // JWT errors
  if (err?.name === 'TokenExpiredError') {
    return res.status(401).json({ status: 401, message: 'Access token expired' });
  }
  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({ status: 401, message: 'Unauthorized' });
  }

  if (isHttpError(err)) {
    const status = err.status ?? 500;
    return res.status(status).json({ status, message: err.message });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Error:', err);
  }
  return res.status(500).json({ status: 500, message: 'Internal Server Error' });
};
