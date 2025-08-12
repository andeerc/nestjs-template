import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from './commands/login.command';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly commandBus: CommandBus) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.commandBus.execute(new LoginCommand(loginDto.email, loginDto.password));
  }
}
