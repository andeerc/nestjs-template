import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserDto } from '../dto/user.dto';
import { DatabaseService } from '@/infrastructure/database/database.service';

export class GetUserByEmailQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler
  implements IQueryHandler<GetUserByEmailQuery, UserDto | null>
{
  constructor(private readonly dbService: DatabaseService) {}

  async execute(query: GetUserByEmailQuery): Promise<UserDto | null> {
    // Join user_logins to get email information
    const user = await this.dbService
      .getKnex()('users as u')
      .join('user_logins as ul', 'u.id', 'ul.user_id')
      .where('ul.email', query.email)
      .select([
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.phone',
        'u.avatar_url',
        'u.role',
        'u.is_active',
        'u.email_verified',
        'u.email_verified_at',
        'u.preferences',
        'u.metadata',
        'u.created_at',
        'u.updated_at',
        'ul.email',
      ])
      .first();

    if (!user) {
      return null;
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
