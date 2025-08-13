import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { EmailService } from '@/integrations/email/email.service';
import { generateId } from '@/shared/utils/generate-id';
import * as crypto from 'crypto';

export class ResendVerificationCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendVerificationCommand)
export class ResendVerificationCommandHandler
  implements ICommandHandler<ResendVerificationCommand, { message: string }>
{
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ResendVerificationCommand): Promise<{ message: string }> {
    // Find user by email through user_logins table
    const userLogin = await this.knex('user_logins as ul')
      .join('users as u', 'ul.user_id', 'u.id')
      .where('ul.email', command.email)
      .select([
        'u.id as user_id',
        'u.first_name',
        'u.email_verified',
        'ul.email',
      ])
      .first();

    if (!userLogin) {
      // For security, return success message even if user doesn't exist
      return { message: 'Verification email sent if user exists' };
    }

    // If already verified, return success message
    if (userLogin.email_verified) {
      return { message: 'Verification email sent if user exists' };
    }

    return this.knex.transaction(async (trx) => {
      // Invalidate any existing tokens for this user
      await trx('email_verification_tokens')
        .where({ user_id: userLogin.user_id, is_used: false })
        .update({ is_used: true });

      // Create new verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await trx('email_verification_tokens').insert({
        id: generateId(),
        user_id: userLogin.user_id,
        token,
        email: command.email,
        expires_at: expiresAt,
        is_used: false,
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(
        command.email,
        userLogin.first_name,
        token,
      );

      return { message: 'Verification email sent if user exists' };
    });
  }
}