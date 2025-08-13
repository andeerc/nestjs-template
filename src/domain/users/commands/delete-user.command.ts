import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand, void> {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    // Check if user exists first
    const user = await this.knex('users').where({ id: command.id }).first();

    if (!user) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    // Use transaction to ensure both user and user_login records are deleted
    await this.knex.transaction(async (trx) => {
      // Delete user_login records first (due to foreign key constraint)
      await trx('user_logins').where({ user_id: command.id }).del();

      // Delete user record
      await trx('users').where({ id: command.id }).del();
    });
  }
}
