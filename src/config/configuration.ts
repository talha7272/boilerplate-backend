export interface AppConfig {
  env: string;
  port: number;
  db: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origins: string[];
  };
  email: {
    resendApiKey: string;
    from: string;
  };
  frontendUrl: string;
}

const required = ['DATABASE_URL', 'JWT_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM', 'FRONTEND_URL'];

export default (): AppConfig => {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT as string, 10) || 5000,

    db: {
      url: process.env.DATABASE_URL as string,
    },

    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS as string, 10) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 100,
    },

    cors: {
      origins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
    },

    email: {
      resendApiKey: process.env.RESEND_API_KEY as string,
      from: process.env.EMAIL_FROM as string,
    },

    frontendUrl: process.env.FRONTEND_URL as string,
  };
};
