import { argon2id, argon2Verify } from 'argon2-wasm-edge';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { User as UserSchema } from '../db/schema';

export interface UserData {
  Id: number;
  Role: number | null;
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  Password: string | null;
  CreatedAt: Date | null;
}

export interface SafeUserData {
  Id: number;
  Role: number | null;
  FirstName: string | null;
  LastName: string | null;
  CreatedAt: Date | null;
}

export class UserRepository {
  /**
   * Find a user by email (includes password for auth)
   */
  static async findByEmail(email: string): Promise<UserData | null> {
    const result = await db
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.Email, email.toLowerCase()));

    if (result.length === 0) return null;
    return result[0] as UserData;
  }

  /**
   * Find a user by ID
   */
  static async findById(id: number, sensitive: boolean = false): Promise<UserData | SafeUserData | null> {
    const result = await db
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.Id, id));

    if (result.length === 0) return null;
    const user = result[0] as UserData;

    if (!sensitive) {
      return {
        Id: user.Id,
        Role: user.Role,
        FirstName: user.FirstName,
        LastName: user.LastName,
        CreatedAt: user.CreatedAt
      } as SafeUserData;
    }
    return user;
  }

  /**
   * Register a new user
   */
  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<UserData> {
    const salt = crypto.randomBytes(16);
    const hashedPassword = await argon2id({
      password,
      salt,
      iterations: 3,
      parallelism: 1,
      memorySize: 65536,
      hashLength: 32,
      outputType: 'encoded',
    });

    const newUser = {
      Email: email.toLowerCase(),
      Role: 3, // Regular user role
      Password: hashedPassword,
      FirstName: firstName,
      LastName: lastName
    };

    const result = await db
      .insert(UserSchema)
      .values(newUser)
      .returning();

    return result[0] as UserData;
  }

  /**
   * Verify user password
   */
  static async verifyPassword(storedHash: string, password: string): Promise<boolean> {
    return argon2Verify({ password, hash: storedHash });
  }

  static async updatePassword(userId: number, newPassword: string): Promise<void> {
    const salt = crypto.randomBytes(16);
    const hashedPassword = await argon2id({
      password: newPassword,
      salt,
      iterations: 3,
      parallelism: 1,
      memorySize: 65536,
      hashLength: 32,
      outputType: 'encoded',
    });

    await db
      .update(UserSchema)
      .set({ Password: hashedPassword })
      .where(eq(UserSchema.Id, userId));
  }

  /**
   * Check if email is already registered
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await db
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.Email, email.toLowerCase()));

    return result.length > 0;
  }
}
