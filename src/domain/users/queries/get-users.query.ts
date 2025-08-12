import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserDto } from '../dto/user.dto';
import { BaseFilterDto, PaginationDto } from '@/shared/dto';
import { DatabaseService } from '@/infrastructure/database/database.service';

export class GetUsersQuery {
  constructor(
    public readonly filter?: BaseFilterDto,
    public readonly pagination?: PaginationDto,
  ) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<GetUsersQuery, UserDto[]> {
  constructor(private readonly dbService: DatabaseService) {}

  async execute(query: GetUsersQuery): Promise<UserDto[]> {
    let queryBuilder = this.dbService.getKnex()('users').select('*');

    // Apply filters if provided
    if (query.filter) {
      if (query.filter.search) {
        queryBuilder = queryBuilder.where(function () {
          this.where('email', 'ilike', `%${query.filter.search}%`)
            .orWhere('first_name', 'ilike', `%${query.filter.search}%`)
            .orWhere('last_name', 'ilike', `%${query.filter.search}%`);
        });
      }

      if (query.pagination.limit) {
        queryBuilder = queryBuilder.limit(query.pagination.limit);
      }

      if (query.pagination.page) {
        queryBuilder = queryBuilder.offset((query.pagination.page - 1) * query.pagination.limit);
      }
    }

    const users = await queryBuilder.orderBy('created_at', 'desc');
    return users.map(this.mapToDto);
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
