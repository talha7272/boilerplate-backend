import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { AppConfig } from '../config/configuration';

export const DRIZZLE = Symbol('DRIZZLE');
export type DrizzleDb = NeonHttpDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>): DrizzleDb => {
        const url = configService.get('db.url', { infer: true });
        const sql = neon(url);
        return drizzle(sql, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
