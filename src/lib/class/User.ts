import { db } from '$lib/server/db/';
import { User as UserSchema } from '$lib/server/db/schema';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';

export class User {
	id: number;
	role: number;
	firstName: string;
	lastName: string;
	email: string;
	password: string;

	constructor(
		id: number,
		role: number,
		firstName: string,
		lastName: string,
		email: string,
		password: string
	) {
		this.id = id;
		this.role = role;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = password;

		if (this.email) {
			this.email = this.email.toLowerCase();
		}

		if (this.id) {
			this.initializeUser();
		}
	}

	/**
	 * Creates a new User instance and calls the initializeUser() function
	 */
	static create(
		id: number,
		role: number,
		firstName: string,
		lastName: string,
		email: string,
		password: string
	): User {
		const user = new User(id, role, firstName, lastName, email, password);
		user.initializeUser();
		return user;
	}

	/**
	 * Placeholder function called when a new User is created via User.create()
	 */
	private initializeUser(): void {
		db.select()
			.from(UserSchema)
			.where(this.email ? eq(UserSchema.email, this.email) : eq(UserSchema.id, this.id))
			.then((result) => {
				this.role = result[0].role as number;
				this.firstName = result[0].firstName as string;
				this.lastName = result[0].lastName as string;
				this.email = result[0].email as string;
				this.password = result[0].password as string;
			})
			.catch((error) => {
				throw Error('Error initializing user:', error);
			});
	}

	/**
	 * Register a new user
	 */
	async register(email: string, password: string, first_name: string, last_name: string): Promise<boolean> {
		// Implementation to register user
		// This would typically involve database operations

		const newUser = {
			email,
			role: 1,
			password: await argon2.hash(password),
			first_name,
			last_name
		};

		// Insert the new user into the database
		db.insert(UserSchema)
			.values(newUser)
			.returning()
			.then((result) => {
				console.log('User registered successfully:', result);
			})
			.catch((error) => {
				throw Error('Error registering user:', error);
			});

		return true;
	}

	/**
	 * Login a user
	 */
	login(password: string): boolean {
		// Implementation to authenticate user
		// This would typically check credentials against stored values
		db.select()
			.from(UserSchema)
			.where(eq(UserSchema.email, this.email))
			.then(async (result) => {
				if (result.length === 0) {
					throw new Error('User not found');
				}

				const user = result[0];
				const verificationResult = await argon2.verify(user.password as string, password);
				if (!verificationResult) {
					throw new Error('Invalid password');
				}

				this.id = user.id;
				this.role = user.role as number;
				this.firstName = user.firstName as string;
				this.lastName = user.lastName as string;
				this.email = user.email as string;
			})
			.catch((error) => {
				throw Error('Error logging in:', error);
			});
		return true;
	}

	/**
	 * View user profile
	 */
	viewProfile(): this {
		if (!this.id) {
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
		this.firstName = details.firstName;
		this.lastName = details.lastName;
		this.email = details.email;
		this.role = details.role;
		// Typically wouldn't update password here, would have separate method

		return true;
	}
}
