import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

export class VerifyEmailCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailCommandHandler
  implements ICommandHandler<VerifyEmailCommand, { success: boolean; message: string }>
{
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async execute(command: VerifyEmailCommand): Promise<{ success: boolean; message: string }> {
    return this.knex.transaction(async (trx) => {
      // Find the verification token
      const verificationToken = await trx('email_verification_tokens')
        .where({ token: command.token, is_used: false })
        .first();

      if (!verificationToken) {
        throw new NotFoundException('Invalid or expired verification token');
      }

      // Check if token is expired
      if (new Date(verificationToken.expires_at) < new Date()) {
        throw new BadRequestException('Verification token has expired');
      }

      // Mark token as used
      await trx('email_verification_tokens')
        .where({ id: verificationToken.id })
        .update({ is_used: true });

      // Update user email verification status
      await trx('users')
        .where({ id: verificationToken.user_id })
        .update({
          email_verified: true,
          email_verified_at: new Date(),
        });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    });
  }
}