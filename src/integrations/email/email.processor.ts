import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SendEmailDto } from './dto/send-email.dto';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job<SendEmailDto>): Promise<void> {
    const { data } = job;

    this.logger.log(`Processing email job for: ${data.to}`);

    try {
      // In a real implementation, you would integrate with:
      // - NodeMailer (SMTP)
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // etc.

      // Mock email sending
      await this.mockSendEmail(data);

      this.logger.log(`Email sent successfully to: ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.to}:`, error);
      throw error; // This will trigger job retry
    }
  }

  private async mockSendEmail(emailData: SendEmailDto): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.log('📧 Mock Email Sent:');
    this.logger.log(`   To: ${emailData.to}`);
    this.logger.log(`   Subject: ${emailData.subject}`);

    if (emailData.template) {
      this.logger.log(`   Template: ${emailData.template}`);
      this.logger.log(`   Context: ${JSON.stringify(emailData.context)}`);
    } else {
      this.logger.log(`   Body: ${emailData.text || emailData.html}`);
    }

    // Simulate occasional failures for testing retry logic
    if (Math.random() < 0.1) {
      // 10% failure rate
      throw new Error('Simulated email service failure');
    }
  }
}
