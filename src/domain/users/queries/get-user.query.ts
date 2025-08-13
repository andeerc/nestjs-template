import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { InjectKnex, Knex } from 'nestjs-knex';
import { UserMapper } from '../utils/user-mapper.util';

export class GetUserQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery, UserDto> {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    const user = await this.knex('users as u')
      .leftJoin('user_logins as ul', 'u.id', 'ul.user_id')
      .where({ 'u.id': query.id })
      .select([
        'u.*',
        'ul.email',
      ])
      .first();

    if (!user) {
      throw new NotFoundException(`User with ID ${query.id} not found`);
    }

    return UserMapper.toDto(user);
  }

}
