import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserDto } from '../dto/user.dto';
import { BaseFilterDto, PaginationDto } from '@/shared/dto';
import { InjectKnex, Knex } from 'nestjs-knex';
import { UserMapper } from '../utils/user-mapper.util';

export class GetUsersQuery {
  constructor(
    public readonly filter?: BaseFilterDto,
    public readonly pagination?: PaginationDto,
  ) { }
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<GetUsersQuery, UserDto[]> {
  constructor(@InjectKnex() private readonly knex: Knex) { }

  async execute(query: GetUsersQuery): Promise<UserDto[]> {
    let queryBuilder = this.knex('users as u')
      .leftJoin('user_logins as ul', 'u.id', 'ul.user_id')
      .select([
        'u.*',
        'ul.email',
      ]);

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
    return UserMapper.toDtoArray(users);
  }

}
