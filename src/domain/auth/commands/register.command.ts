import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { generateId } from '@/shared/utils/generate-id';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponseDto } from '../dto/login-response.dto';
import { UserRole } from '../../users/entities/user.entity';
import { LoginStatus } from '../entities/user-login.entity';
import { JwtUtilService } from '@/infrastructure/auth/jwt-util.service';
import { InjectKnex, Knex } from 'nestjs-knex';

export class RegisterCommand {
  constructor(public readonly registerDto: RegisterDto) {}
}

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler
  implements ICommandHandler<RegisterCommand, RegisterResponseDto>
{
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly jwtService: JwtUtilService,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResponseDto> {
    // Check if user already exists
    const existingLogin = await this.knex('user_logins')
      .where({ email: command.registerDto.email })
      .first();

    if (existingLogin) {
      throw new ConflictException('User with this email already exists');
    }

    // Start transaction
    return this.knex.transaction(async (trx) => {
      try {
        // Create user record
        const userId = generateId();
        const [user] = await trx('users')
          .insert({
            id: userId,
            first_name: command.registerDto.firstName,
            last_name: command.registerDto.lastName,
            phone: command.registerDto.phone || null,
            avatar_url: command.registerDto.avatarUrl || null,
            role: UserRole.USER,
            is_active: true,
            email_verified: false,
            preferences: command.registerDto.preferences
              ? JSON.stringify(command.registerDto.preferences)
              : null,
            metadata: command.registerDto.metadata
              ? JSON.stringify(command.registerDto.metadata)
              : null,
          })
          .returning('*');

        // Create user login record
        const salt = crypto.randomBytes(32).toString('hex');
        const passwordHash = await bcrypt.hash(command.registerDto.password + salt, 12);

        await trx('user_logins').insert({
          id: generateId(),
          user_id: userId,
          email: command.registerDto.email,
          password_hash: passwordHash,
          salt,
          status: LoginStatus.ACTIVE,
          failed_attempts: 0,
        });

        const payload = {
          sub: user.id,
          email: command.registerDto.email,
          role: user.role,
        };

        return {
          accessToken: this.jwtService.generateToken(payload),
          tokenType: 'Bearer',
          expiresIn: '3600',
          user: {
            id: user.id,
            email: command.registerDto.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            avatarUrl: user.avatar_url,
            role: user.role,
            isActive: user.is_active,
            emailVerified: user.email_verified,
            emailVerifiedAt: user.email_verified_at,
            preferences: user.preferences ? JSON.parse(user.preferences) : null,
            metadata: user.metadata ? JSON.parse(user.metadata) : null,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
        };
      } catch (error) {
        throw new BadRequestException('Failed to register user');
      }
    });
  }
}
