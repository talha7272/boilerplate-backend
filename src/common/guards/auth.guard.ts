import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { AppException } from '../exceptions/app.exception';
import { HTTP_STATUS } from '../../constants/http-status';
import { AppConfig } from '../../config/configuration';
import type { AuthenticatedRequest, JwtPayload } from '../types/authenticated-request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppException('Missing or invalid authorization header', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const secret = this.configService.get('jwt.secret', { infer: true });

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = decoded;
      return true;
    } catch (err) {
      if ((err as Error).name === 'TokenExpiredError') {
        throw new AppException('Token has expired', HTTP_STATUS.UNAUTHORIZED);
      }
      if ((err as Error).name === 'JsonWebTokenError') {
        throw new AppException('Invalid token', HTTP_STATUS.UNAUTHORIZED);
      }
      throw err;
    }
  }
}
