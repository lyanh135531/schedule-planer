import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/auth/login
 * Simple login endpoint (mock for now)
 */
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { username, password } = body;

		if (!username || !password) {
			return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
		}

		// Mock login - accept any username/password for development
		// TODO: Integrate with real TalkFirst API

		// Check if user exists
		let user = await db.select().from(users).where(eq(users.username, username)).limit(1);

		if (user.length === 0) {
			// Create new user
			const [newUser] = await db
				.insert(users)
				.values({
					username,
					refreshToken: 'mock_token_' + Date.now(),
				})
				.returning();
			user = [newUser];
		}

		// Set cookie
		const response = NextResponse.json({
			message: 'Login successful',
			user: {
				id: user[0].id,
				username: user[0].username,
			},
		});

		response.cookies.set('user_id', user[0].id, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return response;
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
