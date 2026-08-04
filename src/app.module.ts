import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DrizzleModule } from './db/drizzle.module';
import { EmailModule } from './common/email/email.module';
import { UserModule } from './features/user/user.module';
import { ProjectModule } from './features/project/project.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DrizzleModule,
    EmailModule,
    UserModule,
    ProjectModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
