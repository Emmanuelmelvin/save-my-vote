import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database/database-errors.js';
import { User, type OrganizationType } from './user.entity.js';

export interface NewUser {
  email: string;
  fullName: string;
  passwordHash: string | null;
  googleId?: string | null;
  isVerified?: boolean;
  organizationType?: OrganizationType | null;
  organizationName?: string | null;
}

export interface GoogleIdentity {
  googleId: string;
  email: string;
  fullName: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOneBy({ id });
  }

  /** With `withPassword`, also loads the normally hidden password hash. */
  findByEmail(
    email: string,
    options: { withPassword?: boolean } = {},
  ): Promise<User | null> {
    const query = this.users
      .createQueryBuilder('user')
      .where('user.email = :email', {
        email: UsersService.normalizeEmail(email),
      });
    if (options.withPassword) query.addSelect('user.passwordHash');
    return query.getOne();
  }

  /** Inserts and lets the unique index decide on duplicates (no racy pre-check). */
  async create(data: NewUser): Promise<User> {
    try {
      return await this.users.save(
        this.users.create({
          ...data,
          email: UsersService.normalizeEmail(data.email),
          googleId: data.googleId ?? null,
          isVerified: data.isVerified ?? false,
          organizationType: data.organizationType ?? null,
          organizationName: data.organizationName ?? null,
        }),
      );
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'An account with this email address already exists',
        );
      }
      throw error;
    }
  }

  async markVerified(id: string): Promise<boolean> {
    const result = await this.users.update({ id }, { isVerified: true });
    return Boolean(result.affected);
  }

  async recordVerificationEmailSent(id: string): Promise<void> {
    await this.users.update({ id }, { verificationEmailSentAt: new Date() });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.users.update(
      { id },
      { passwordHash, passwordChangedAt: new Date() },
    );
  }

  /**
   * Finds the user by Google id, else links the Google account to an existing
   * user with the same (Google-verified) email, else creates one.
   */
  async upsertFromGoogle(identity: GoogleIdentity): Promise<User> {
    const email = UsersService.normalizeEmail(identity.email);
    const existing =
      (await this.users.findOneBy({ googleId: identity.googleId })) ??
      (await this.users.findOneBy({ email }));

    if (!existing) {
      return this.create({
        email,
        fullName: identity.fullName,
        passwordHash: null,
        googleId: identity.googleId,
        isVerified: true,
      });
    }

    const changes: Partial<User> = {};
    if (!existing.googleId) changes.googleId = identity.googleId;
    if (!existing.isVerified) changes.isVerified = true;
    if (Object.keys(changes).length > 0) {
      await this.users.update({ id: existing.id }, changes);
      Object.assign(existing, changes);
    }
    return existing;
  }
}
