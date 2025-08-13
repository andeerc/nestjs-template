import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserDto } from '../dto/user.dto';
import { InjectKnex, Knex } from 'nestjs-knex';
import { UserMapper } from '../utils/user-mapper.util';

export class GetUserByEmailQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler
  implements IQueryHandler<GetUserByEmailQuery, UserDto | null>
{
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async execute(query: GetUserByEmailQuery): Promise<UserDto | null> {
    // Join user_logins to get email information
    const user = await this.knex('users as u')
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

    return UserMapper.toDto(user);
  }

}
