import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { DatabaseService } from '@/infrastructure/database/database.service';

export class GetUserQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery, UserDto> {
  constructor(private readonly dbService: DatabaseService) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    const user = await this.dbService
      .getKnex()('users')
      .where({ id: query.id })
      .select('*')
      .first();

    if (!user) {
      throw new NotFoundException(`User with ID ${query.id} not found`);
    }

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
