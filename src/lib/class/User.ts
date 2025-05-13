import { DEBUG, VERBOSE } from '$env/static/private';
import { db } from '$lib/server/db/';
import { User as UserSchema } from '$lib/server/db/schema';
import { typical_development_notice } from '$lib/utility/typicals';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';

export class User {
	Id: number;
	Role: number;
	FirstName: string;
	LastName: string;
	Email: string;
	Password: string;
	CreatedAt: Date;

	constructor(
		id: number,
		role: number,
		firstName: string,
		lastName: string,
		email: string,
		password: string,
		created_at: Date = new Date()
	) {
		this.Id = id;
		this.Role = role;
		this.FirstName = firstName;
		this.LastName = lastName;
		this.Email = email;
		this.Password = password;
		this.CreatedAt = created_at;

		if (this.Email) {
			this.Email = this.Email.toLowerCase();
		}

		if (this.Id > 0) {
			this.initializeUser();
		}
	}

	/**
	 * Creates a new User instance and calls the initializeUser() function
	 */
	static async create(
		role: number,
		firstName: string,
		lastName: string,
		email: string,
		password: string
	): Promise<User | Error> {
		const user = new User(0, role, firstName, lastName, email, password);
		const ret_val = await user.initializeUser().catch((error: Error) => {
			return error;
		});
		if (ret_val) {
			return ret_val;
		}
		return user;
	}

	/**
	 * Placeholder function called when a new User is created via User.create()
	 */
	private async initializeUser(): Promise<void | Error> {
		await db
			.select()
			.from(UserSchema)
			.where(this.Email ? eq(UserSchema.Email, this.Email) : eq(UserSchema.Id, this.Id))
			.then((result) => {
				if (result.length > 0) {
					this.Id = result[0].Id;
					this.Role = result[0].Role as number;
					this.FirstName = result[0].FirstName as string;
					this.LastName = result[0].LastName as string;
					this.Email = result[0].Email as string;
					this.Password = result[0].Password as string;
					this.CreatedAt = result[0].CreatedAt as Date;
				} else {
					return new Error('User not found');
				}
			})
			.catch((error) => {
				throw Error('Error initializing user: ' + error);
			});
	}

	/**
	 * Find a user by ID
	 */
	static async findById(id: number, sensitive: boolean = false): Promise<User | Error> {
		const createdUser = new User(id, 0, '', '', '', '');
		await createdUser.initializeUser();
		if (!sensitive) {
			createdUser.Password = 'did_you_really_think';
			createdUser.Email = 'did_you_really_think@this_would_work.com';
		}
		if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)) {
			typical_development_notice();
			console.log('Created user:', createdUser);
		}
		if (createdUser instanceof Error) {
			throw createdUser;
		}
		if (createdUser instanceof User) {
			if (!isNaN(createdUser.Id)) {
				return createdUser;
			}
		}
		throw new Error('User not found');
	}

	/**
	 * Find a user by email
	 */
	static async findByEmail(email: string): Promise<User | Error> {
		const emailToFind = email.toLowerCase();
		const createdUser = await this.create(0, '', '', emailToFind, '');
		if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)) {
			typical_development_notice();
			console.log('Created user:', createdUser);
		}
		if (createdUser instanceof Error) {
			throw createdUser;
		}
		if (createdUser instanceof User) {
			if (!isNaN(createdUser.Id)) {
				return createdUser;
			}
		}
		throw new Error('User not found');
	}

	/**
	 * Register a new user
	 */
	async register(
		email: string,
		password: string,
		first_name: string,
		last_name: string
	): Promise<boolean> {
		// Implementation to register user
		// This would typically involve database operations

		const newUser = {
			Email: email,
			Role: 3, // Regular user role
			Password: await argon2.hash(password),
			FirstName: first_name,
			LastName: last_name
		};

		// Insert the new user into the database
		await db
			.insert(UserSchema)
			.values(newUser)
			.returning()
			.then((result) => {
				if (JSON.parse(DEBUG)) {
					typical_development_notice();
					console.log('User registered successfully:', result);
				}
			})
			.catch((error) => {
				if (JSON.parse(DEBUG)) {
					typical_development_notice();
					throw Error('Error registering user:', error);
				}
			});

		return true;
	}

	/**
	 * Login a user
	 */
	async login(password: string): Promise<boolean> {
		// Implementation to authenticate user
		// This would typically check credentials against stored values
		await db
			.select()
			.from(UserSchema)
			.where(eq(UserSchema.Email, this.Email))
			.then(async (result) => {
				if (result.length === 0) {
					throw new Error('User not found');
				}

				const user = result[0];
				const verificationResult = await argon2.verify(user.Password as string, password);
				if (!verificationResult) {
					throw new Error('Invalid password');
				}

				this.Id = user.Id;
				this.Role = user.Role as number;
				this.FirstName = user.FirstName as string;
				this.LastName = user.LastName as string;
				this.Email = user.Email as string;
				this.CreatedAt = user.CreatedAt as Date;
			})
			.catch((error) => {
				throw Error('Error logging in: ' + error);
			});
		return true;
	}

	/**
	 * View user profile
	 */
	viewProfile(): this {
		if (!this.Id) {
			throw new Error('User ID is not set');
		}
		// Return the current user instance
		return this;
	}

	/**
	 * Update user profile
	 */
	updateProfile(details: User): boolean {
		// Implementation to update user details
		this.FirstName = details.FirstName;
		this.LastName = details.LastName;
		this.Email = details.Email;
		this.Role = details.Role;
		// Typically wouldn't update password here, would have separate method

		return true;
	}
}
