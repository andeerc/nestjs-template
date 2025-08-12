export enum LoginStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  LOCKED = 'locked',
}

export class UserLogin {
  id: string;
  userId: string;
  email: string;
  passwordHash: string;
  salt: string;
  status: LoginStatus;
  failedAttempts: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserLogin>) {
    Object.assign(this, data);
  }

  isActive(): boolean {
    return this.status === LoginStatus.ACTIVE;
  }

  isLocked(): boolean {
    return (
      this.status === LoginStatus.LOCKED || (this.lockedUntil && this.lockedUntil > new Date())
    );
  }

  isSuspended(): boolean {
    return this.status === LoginStatus.SUSPENDED;
  }

  canLogin(): boolean {
    return this.isActive() && !this.isLocked() && !this.isSuspended();
  }

  recordFailedAttempt(): void {
    this.failedAttempts += 1;

    // Lock account after 5 failed attempts
    if (this.failedAttempts >= 5) {
      this.lock(30); // Lock for 30 minutes
    }
  }

  recordSuccessfulLogin(ipAddress?: string): void {
    this.failedAttempts = 0;
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;

    // Unlock if it was locked due to failed attempts
    if (this.isLocked() && this.lockedUntil) {
      this.unlock();
    }
  }

  lock(minutes: number = 30): void {
    this.status = LoginStatus.LOCKED;
    this.lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
  }

  unlock(): void {
    if (this.status === LoginStatus.LOCKED) {
      this.status = LoginStatus.ACTIVE;
    }
    this.lockedUntil = null;
    this.failedAttempts = 0;
  }

  suspend(): void {
    this.status = LoginStatus.SUSPENDED;
  }

  activate(): void {
    this.status = LoginStatus.ACTIVE;
    this.lockedUntil = null;
    this.failedAttempts = 0;
  }

  deactivate(): void {
    this.status = LoginStatus.INACTIVE;
  }

  updateEmail(newEmail: string): void {
    this.email = newEmail;
  }

  updatePassword(newPasswordHash: string, newSalt: string): void {
    this.passwordHash = newPasswordHash;
    this.salt = newSalt;
    this.failedAttempts = 0; // Reset failed attempts on password change
  }
}
