import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '@/domain/auth/auth.service';
import { LoginDto } from '@/domain/auth/dto/login.dto';
import { LoginResponseDto } from '@/domain/auth/dto/login-response.dto';
import { Public } from './decorators/public.decorator';
import { Ip } from './decorators/ip.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Ip() ipAddress: string): Promise<LoginResponseDto> {
    return this.authService.login(loginDto, ipAddress);
  }
}
