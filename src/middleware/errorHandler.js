import createHttpError, { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, _next) => {
  if (isHttpError(err)) {
    return res.status(err.status || 500).json({
      status: err.status || 500,
      message: err.message,
    });
  }

  // Beklenmeyen hatalar
  console.error('Unhandled Error:', err);
  return res.status(500).json({
    status: 500,
    message: 'Something went wrong',
  });
};
