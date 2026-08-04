import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    this.resend = new Resend(this.configService.get('email.resendApiKey', { infer: true }));
    this.from = this.configService.get('email.from', { infer: true });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Reset your password',
      html: `
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
      `,
    });
  }
}
