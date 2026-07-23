import { HTTP_STATUS } from '../constants/httpStatus.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!err.isOperational) {
    console.error('Unexpected error:', err);
  }

  res.status(statusCode).json({
    status: String(statusCode),
    description: err.message || 'Internal Server Error',
    data: null,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
