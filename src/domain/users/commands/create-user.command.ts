import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { generateId } from '@/shared/utils/generate-id';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import { UserRole } from '../entities/user.entity';
import { InjectKnex, Knex } from 'nestjs-knex';
import { UserMapper } from '../utils/user-mapper.util';

export class CreateUserCommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, UserDto> {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
    const id = generateId();

    const [user] = await this.knex('users')
      .insert({
        id,
        first_name: command.createUserDto.firstName,
        last_name: command.createUserDto.lastName,
        phone: command.createUserDto.phone || null,
        avatar_url: command.createUserDto.avatarUrl || null,
        role: command.createUserDto.role || UserRole.USER,
        is_active:
          command.createUserDto.isActive !== undefined ? command.createUserDto.isActive : true,
        email_verified: false,
        preferences: command.createUserDto.preferences
          ? JSON.stringify(command.createUserDto.preferences)
          : null,
        metadata: command.createUserDto.metadata
          ? JSON.stringify(command.createUserDto.metadata)
          : null,
      })
      .returning('*');

    return UserMapper.toDto(user);
  }

}
