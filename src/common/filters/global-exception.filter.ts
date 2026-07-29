import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status';
import { AppException } from '../exceptions/app.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { statusCode, message, isOperational, stack } = this.normalize(err, req);
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isOperational) {
      console.error('Unexpected error:', err);
    }

    res.status(statusCode).json({
      status: String(statusCode),
      description: message,
      data: null,
      ...(isProduction ? {} : { stack }),
    });
  }

  private normalize(
    err: unknown,
    req: Request,
  ): {
    statusCode: number;
    message: string;
    isOperational: boolean;
    stack?: string;
  } {
    if (err instanceof AppException) {
      return {
        statusCode: err.statusCode,
        message: err.message || 'Internal Server Error',
        isOperational: true,
        stack: err.stack,
      };
    }

    if (err instanceof NotFoundException) {
      return {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: `Route not found: ${req.originalUrl}`,
        isOperational: true,
        stack: err.stack,
      };
    }

    if (err instanceof HttpException) {
      const statusCode = err.getStatus();
      const response = err.getResponse();
      const message = this.extractHttpExceptionMessage(response, err.message);
      return { statusCode, message, isOperational: true, stack: err.stack };
    }

    const error = err as Error;
    return {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: error?.message || 'Internal Server Error',
      isOperational: false,
      stack: error?.stack,
    };
  }

  private extractHttpExceptionMessage(response: unknown, fallback: string): string {
    if (typeof response === 'string') return response;
    if (response && typeof response === 'object' && 'message' in response) {
      const { message } = response as { message: string | string[] };
      return Array.isArray(message) ? message.join(', ') : message;
    }
    return fallback;
  }
}
