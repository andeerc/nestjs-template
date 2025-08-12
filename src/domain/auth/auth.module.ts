import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LoginCommandHandler } from './commands/login.command';
import { ConfigurationService } from '@/infrastructure/configuration/configuration.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    CqrsModule,
    JwtModule.registerAsync({
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, LoginCommandHandler],
  exports: [AuthService],
})
export class AuthModule {}
