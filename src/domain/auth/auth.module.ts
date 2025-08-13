import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LoginCommandHandler } from './commands/login.command';
import { RegisterCommandHandler } from './commands/register.command';
import { SendVerificationEmailCommandHandler } from './commands/send-verification-email.command';
import { VerifyEmailCommandHandler } from './commands/verify-email.command';
import { ResendVerificationCommandHandler } from './commands/resend-verification.command';
import { ConfigurationService } from '@/infrastructure/configuration/configuration.service';
import { UsersModule } from '../users/users.module';
import { IntegrationsModule } from '@/integrations/integrations.module';

@Module({
  imports: [
    UsersModule,
    IntegrationsModule,
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
  providers: [
    AuthService, 
    JwtStrategy, 
    LoginCommandHandler,
    RegisterCommandHandler,
    SendVerificationEmailCommandHandler,
    VerifyEmailCommandHandler,
    ResendVerificationCommandHandler,
  ],
  exports: [AuthService],
})
export class AuthModule {}
