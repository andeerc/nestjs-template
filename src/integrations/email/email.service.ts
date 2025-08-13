import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(emailData: SendEmailDto): Promise<void> {
    this.logger.log(`Queuing email to: ${emailData.to}`);

    await this.emailQueue.add('send-email', emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      delay: 2000,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const emailData: SendEmailDto = {
      to,
      subject: 'Welcome to our platform!',
      template: 'welcome',
      context: {
        name,
        loginUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    };

    await this.sendEmail(emailData);
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const emailData: SendEmailDto = {
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        validFor: '1 hour',
      },
    };

    await this.sendEmail(emailData);
  }

  async sendNotificationEmail(to: string, title: string, message: string): Promise<void> {
    const emailData: SendEmailDto = {
      to,
      subject: title,
      template: 'notification',
      context: {
        title,
        message,
        timestamp: new Date().toISOString(),
      },
    };

    await this.sendEmail(emailData);
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const emailData: SendEmailDto = {
      to,
      subject: 'Verify your email address',
      template: 'email-verification',
      context: {
        name,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
        token,
        validFor: '24 hours',
      },
    };

    await this.sendEmail(emailData);
  }
}
