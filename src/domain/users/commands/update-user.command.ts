import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';
import { DatabaseService } from '@/infrastructure/database/database.service';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand, UserDto> {
  constructor(private readonly dbService: DatabaseService) {}

  async execute(command: UpdateUserCommand): Promise<UserDto> {
    const existingUser = await this.dbService.getKnex()('users').where({ id: command.id }).first();

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${command.id} not found`);
    }

    const updatePayload: any = {
      updated_at: this.dbService.getKnex().fn.now(),
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

    const [user] = await this.dbService
      .getKnex()('users')
      .where({ id: command.id })
      .update(updatePayload)
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
