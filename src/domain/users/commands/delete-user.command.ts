import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';

export class DeleteUserCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand, void> {
  constructor(private readonly dbService: DatabaseService) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    // Check if user exists first
    const user = await this.dbService.getKnex()('users').where({ id: command.id }).first();

    if (!user) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    // Use transaction to ensure both user and user_login records are deleted
    await this.dbService.getKnex().transaction(async (trx) => {
      // Delete user_login records first (due to foreign key constraint)
      await trx('user_logins').where({ user_id: command.id }).del();

      // Delete user record
      await trx('users').where({ id: command.id }).del();
    });
  }
}
