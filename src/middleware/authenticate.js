import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import config from '../config/env.js';

const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', HTTP_STATUS.UNAUTHORIZED));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED));
    }
    next(err);
  }
};

export default authenticate;
