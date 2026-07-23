const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  db: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
  },
};

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

console.log('✅ ENV loaded:', {
  NODE_ENV: config.env,
  PORT: config.port,
  DATABASE_URL: config.db.url ? `${config.db.url.slice(0, 30)}...` : 'MISSING',
  JWT_SECRET: config.jwt.secret ? '✓ set' : 'MISSING',
  CORS_ORIGINS: config.cors.origins,
});

export default config;
