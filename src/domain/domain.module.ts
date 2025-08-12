import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, AuthModule, UsersModule],
  exports: [SharedModule, AuthModule, UsersModule],
})
export class DomainModule {}
