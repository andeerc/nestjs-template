import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/create-user.command';
import { UpdateUserCommand } from './commands/update-user.command';
import { DeleteUserCommand } from './commands/delete-user.command';
import { GetUserQuery } from './queries/get-user.query';
import { GetUsersQuery } from './queries/get-users.query';
import { GetUserByEmailQuery } from './queries/get-user-by-email.query';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async findAll(): Promise<UserDto[]> {
    return this.queryBus.execute(new GetUsersQuery());
  }

  async findById(id: string): Promise<UserDto> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    return this.queryBus.execute(new GetUserByEmailQuery(email));
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.commandBus.execute(new UpdateUserCommand(id, updateUserDto));
  }

  async delete(id: string): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
