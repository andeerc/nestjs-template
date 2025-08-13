import { UserDto } from '../dto/user.dto';

/**
 * Utility class for mapping user database records to DTOs
 */
export class UserMapper {
  /**
   * Maps a user database record to UserDto
   * @param user Raw user record from database
   * @returns UserDto
   */
  static toDto(user: any): UserDto {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email || null,
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
    };
  }

  /**
   * Maps multiple user database records to UserDto array
   * @param users Array of raw user records from database
   * @returns UserDto[]
   */
  static toDtoArray(users: any[]): UserDto[] {
    return users.map((user) => UserMapper.toDto(user));
  }
}