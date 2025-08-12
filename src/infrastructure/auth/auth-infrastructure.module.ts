import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilService } from './jwt-util.service';
import { ConfigurationService } from '../configuration/configuration.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
      }),
    }),
  ],
  providers: [JwtUtilService],
  exports: [JwtUtilService, JwtModule],
})
export class AuthInfrastructureModule {}
