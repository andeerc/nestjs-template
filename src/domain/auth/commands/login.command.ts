import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtUtilService } from '@/infrastructure/auth/jwt-util.service';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginStatus } from '../entities/user-login.entity';
import { InjectKnex, Knex } from 'nestjs-knex';

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly ipAddress?: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand, LoginResponseDto> {
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly jwtUtilService: JwtUtilService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResponseDto> {
    // Get user login record with user data
    const loginRecord = await this.knex('user_logins as ul')
      .join('users as u', 'ul.user_id', 'u.id')
      .where('ul.email', command.email)
      .select([
        'ul.*',
        'u.first_name',
        'u.last_name',
        'u.phone',
        'u.avatar_url',
        'u.role',
        'u.is_active',
        'u.email_verified',
        'u.email_verified_at',
        'u.preferences',
        'u.metadata',
        'u.created_at as user_created_at',
        'u.updated_at as user_updated_at',
      ])
      .first();

    if (!loginRecord) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked or suspended
    if (
      loginRecord.status === LoginStatus.LOCKED ||
      (loginRecord.locked_until && new Date(loginRecord.locked_until) > new Date())
    ) {
      throw new ForbiddenException('Account is locked due to too many failed attempts');
    }

    if (loginRecord.status === LoginStatus.SUSPENDED) {
      throw new ForbiddenException('Account is suspended');
    }

    if (loginRecord.status === LoginStatus.INACTIVE) {
      throw new ForbiddenException('Account is inactive');
    }

    if (!loginRecord.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(
      command.password + loginRecord.salt,
      loginRecord.password_hash,
    );

    if (!passwordValid) {
      // Record failed attempt
      await this.recordFailedAttempt(loginRecord.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Record successful login
    await this.recordSuccessfulLogin(loginRecord.id, command.ipAddress);

    const payload = {
      email: loginRecord.email,
      sub: loginRecord.user_id,
      role: loginRecord.role,
      firstName: loginRecord.first_name,
      lastName: loginRecord.last_name,
    };

    const accessToken = this.jwtUtilService.generateToken(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '3600',
      user: {
        id: loginRecord.user_id,
        email: loginRecord.email,
        firstName: loginRecord.first_name,
        lastName: loginRecord.last_name,
        phone: loginRecord.phone,
        avatarUrl: loginRecord.avatar_url,
        role: loginRecord.role,
        isActive: loginRecord.is_active,
        emailVerified: loginRecord.email_verified,
        emailVerifiedAt: loginRecord.email_verified_at,
        preferences: loginRecord.preferences ? JSON.parse(loginRecord.preferences) : null,
        metadata: loginRecord.metadata ? JSON.parse(loginRecord.metadata) : null,
        createdAt: loginRecord.user_created_at,
        updatedAt: loginRecord.user_updated_at,
      },
    };
  }

  private async recordFailedAttempt(loginId: string): Promise<void> {
    const loginRecord = await this.knex('user_logins')
      .where({ id: loginId })
      .first();

    const newFailedAttempts = (loginRecord?.failed_attempts || 0) + 1;
    const updateData: any = {
      failed_attempts: newFailedAttempts,
      updated_at: this.knex.fn.now(),
    };

    // Lock account after 5 failed attempts for 30 minutes
    if (newFailedAttempts >= 5) {
      updateData.status = LoginStatus.LOCKED;
      updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    await this.knex('user_logins').where({ id: loginId }).update(updateData);
  }

  private async recordSuccessfulLogin(loginId: string, ipAddress?: string): Promise<void> {
    await this.knex('user_logins')
      .where({ id: loginId })
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login_at: this.knex.fn.now(),
        last_login_ip: ipAddress || null,
        updated_at: this.knex.fn.now(),
      });
  }
}
