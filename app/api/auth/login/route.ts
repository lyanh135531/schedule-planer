import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { TalkFirstService } from '@/lib/talkfirst-api';
import { z } from 'zod';
import { encrypt } from '@/lib/crypto';

const loginSchema = z.object({
	email: z.string().email('Invalid email address').min(1, 'Email is required'),
	password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/login
 * Login endpoint integrated with TalkFirst API
 */
export async function POST(req: Request) {
	try {
		const body = await req.json();

		// 1. Validate Input
		const validation = loginSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json({
				message: 'Invalid input',
				errors: validation.error.flatten().fieldErrors
			}, { status: 400 });
		}

		const { email, password } = validation.data;

		// 2. Authenticate with TalkFirst API
		const tokens = await TalkFirstService.login(email, password);
		if (!tokens) {
			return NextResponse.json({ message: 'Email or password is incorrect' }, { status: 401 });
		}

		// 3. Upsert User (Create or Update)
		const encryptedPassword = encrypt(password);

		const [user] = await db
			.insert(users)
			.values({
				email,
				password: encryptedPassword, // Encrypted at rest
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: users.email,
				set: {
					password: encryptedPassword,
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					updatedAt: new Date(),
				},
			})
			.returning();

		// 4. Set Secure Cookie and Respond
		const response = NextResponse.json({
			message: 'Login successful',
			user: {
				id: user.id,
				email: user.email,
			},
			accessToken: tokens.accessToken,
		});

		response.cookies.set('user_id', user.id, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		response.cookies.set('accessToken', tokens.accessToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 2, // 2 hours for access token
		});

		return response;
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
