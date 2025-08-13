import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from './commands/login.command';
import { RegisterCommand } from './commands/register.command';
import { VerifyEmailCommand } from './commands/verify-email.command';
import { SendVerificationEmailCommand } from './commands/send-verification-email.command';
import { ResendVerificationCommand } from './commands/resend-verification.command';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { VerificationResponseDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(private readonly commandBus: CommandBus) { }

  async login(loginDto: LoginDto, ipAddress: string): Promise<LoginResponseDto> {
    return this.commandBus.execute(new LoginCommand(loginDto.email, loginDto.password, ipAddress));
  }

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const result = await this.commandBus.execute(new RegisterCommand(registerDto));
    
    // Send verification email after successful registration
    await this.commandBus.execute(
      new SendVerificationEmailCommand(
        result.user.id,
        result.user.email,
        result.user.firstName,
      ),
    );

    return result;
  }

  async verifyEmail(token: string): Promise<VerificationResponseDto> {
    return this.commandBus.execute(new VerifyEmailCommand(token));
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    return this.commandBus.execute(new ResendVerificationCommand(email));
  }
}
