import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/index.js';

const DATABASE_URL = 'postgresql://neondb_owner:npg_MVhksRaIQ51v@ep-shy-fire-axaullnp-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });
