import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';
import { InjectKnex, Knex } from 'nestjs-knex';
import { UserMapper } from '../utils/user-mapper.util';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand, UserDto> {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async execute(command: UpdateUserCommand): Promise<UserDto> {
    const existingUser = await this.knex('users').where({ id: command.id }).first();

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    const updatePayload: any = {
      updated_at: this.knex.fn.now(),
    };

    if (command.updateUserDto.firstName) updatePayload.first_name = command.updateUserDto.firstName;
    if (command.updateUserDto.lastName) updatePayload.last_name = command.updateUserDto.lastName;
    if (command.updateUserDto.phone !== undefined)
      updatePayload.phone = command.updateUserDto.phone;
    if (command.updateUserDto.avatarUrl !== undefined)
      updatePayload.avatar_url = command.updateUserDto.avatarUrl;
    if (command.updateUserDto.role) updatePayload.role = command.updateUserDto.role;
    if (command.updateUserDto.isActive !== undefined)
      updatePayload.is_active = command.updateUserDto.isActive;
    if (command.updateUserDto.preferences !== undefined)
      updatePayload.preferences = JSON.stringify(command.updateUserDto.preferences);
    if (command.updateUserDto.metadata !== undefined)
      updatePayload.metadata = JSON.stringify(command.updateUserDto.metadata);

    const [user] = await this.knex('users')
      .where({ id: command.id })
      .update(updatePayload)
      .returning('*');

    return UserMapper.toDto(user);
  }

}
