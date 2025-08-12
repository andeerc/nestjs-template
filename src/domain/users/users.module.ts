import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersService } from './users.service';
import { CreateUserCommandHandler } from './commands/create-user.command';
import { UpdateUserCommandHandler } from './commands/update-user.command';
import { DeleteUserCommandHandler } from './commands/delete-user.command';
import { GetUserQueryHandler } from './queries/get-user.query';
import { GetUsersQueryHandler } from './queries/get-users.query';
import { GetUserByEmailQueryHandler } from './queries/get-user-by-email.query';

const CommandHandlers = [
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  DeleteUserCommandHandler,
];

const QueryHandlers = [GetUserQueryHandler, GetUsersQueryHandler, GetUserByEmailQueryHandler];

@Module({
  imports: [CqrsModule],
  providers: [UsersService, ...CommandHandlers, ...QueryHandlers],
  exports: [UsersService],
})
export class UsersModule {}
