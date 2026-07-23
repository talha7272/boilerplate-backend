import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    return next(new AppError(messages, HTTP_STATUS.UNPROCESSABLE_ENTITY));
  }
  next();
};

export default validate;
