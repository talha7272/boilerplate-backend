import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../../constants/http-status';

export const passwordResetRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      status: String(HTTP_STATUS.TOO_MANY_REQUESTS),
      description: 'Too many requests, please try again later.',
      data: null,
    });
  },
});
