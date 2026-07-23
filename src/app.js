import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || config.cors.origins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

// Request body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(
  morgan('combined', {
    skip: () => config.env === 'test',
  })
);

// Global rate limiter
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', env: config.env }));

// Welcome
app.get('/', (_req, res) => res.json({ message: 'Welcome to Boilerplate API', version: '1.0.0', status: 'running' }));

// API routes
app.use('/api/v1', routes);

// 404 + global error handler
app.use(notFound);
app.use(errorHandler);

export default app;
