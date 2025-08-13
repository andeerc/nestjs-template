import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '@/integrations/email/email.service';
import { InjectKnex, Knex } from 'nestjs-knex';
import { generateId } from '@/shared/utils/generate-id';
import * as crypto from 'crypto';

export class SendVerificationEmailCommand {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string,
  ) {}
}

@CommandHandler(SendVerificationEmailCommand)
export class SendVerificationEmailCommandHandler
  implements ICommandHandler<SendVerificationEmailCommand, void>
{
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: SendVerificationEmailCommand): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.knex('email_verification_tokens').insert({
      id: generateId(),
      user_id: command.userId,
      token,
      email: command.email,
      expires_at: expiresAt,
      is_used: false,
    });

    await this.emailService.sendVerificationEmail(
      command.email,
      command.firstName,
      token,
    );
  }
}