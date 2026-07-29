import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';
import { createApp } from '../src/main';

let cachedHandler: Express | undefined;

async function getHandler(): Promise<Express> {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance();
  }
  return cachedHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await getHandler();
  expressApp(req as any, res as any);
}
