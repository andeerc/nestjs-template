import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { generateId } from '@/shared/utils/generate-id';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import { UserRole } from '../entities/user.entity';
import { DatabaseService } from '@/infrastructure/database/database.service';

export class CreateUserCommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, UserDto> {
  constructor(private readonly dbService: DatabaseService) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
    const id = generateId();

    const [user] = await this.dbService
      .getKnex()('users')
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

    return this.mapToDto(user);
  }

  private mapToDto(user: any): UserDto {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      emailVerifiedAt: user.email_verified_at,
      preferences: user.preferences ? JSON.parse(user.preferences) : null,
      metadata: user.metadata ? JSON.parse(user.metadata) : null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
