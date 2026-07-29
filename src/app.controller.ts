import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/configuration';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  @Get('health')
  health() {
    return { status: 'ok', env: this.configService.get('env', { infer: true }) };
  }

  @Get()
  welcome() {
    return { message: 'Welcome to Boilerplate API', version: '1.0.0', status: 'running' };
  }
}
