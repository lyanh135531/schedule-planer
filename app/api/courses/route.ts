import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TalkFirstService } from '@/lib/talkfirst-api';
import { decrypt } from '@/lib/crypto';

/**
 * GET /api/courses
 * Fetches the real student schedule/course list from TalkFirst API.
 * Optimizes by reusing stored access token when available.
 */
export async function GET() {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;
		let accessToken = cookieStore.get('accessToken')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		// 1. Fetch user from DB
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			return NextResponse.json({ message: 'User not found' }, { status: 404 });
		}

		// If no cookie but DB has token, use it
		if (!accessToken && user.accessToken) {
			accessToken = user.accessToken;
		}

		let courses = null;

		// 2. If we have a token (from cookie or DB), try using it directly
		if (accessToken) {
			courses = await TalkFirstService.getClasses(accessToken);
		}

		// 3. If token missing OR invalid (courses is null), perform Re-Login
		if (!courses) {
			console.log(`[API/Courses] Token invalid or missing, attempting re-login for ${user.email}`);

			if (!user.password) {
				return NextResponse.json({ message: 'Missing credentials for re-authentication' }, { status: 401 });
			}

			const decryptedPassword = decrypt(user.password);
			const tokens = await TalkFirstService.login(user.email, decryptedPassword);

			if (!tokens) {
				return NextResponse.json({ message: 'TalkFirst authentication failed' }, { status: 401 });
			}

			accessToken = tokens.accessToken;

			// Update DB with new tokens
			await db.update(users)
				.set({
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					updatedAt: new Date()
				})
				.where(eq(users.id, userId));

			// 4. Fetch courses with the NEW token
			courses = await TalkFirstService.getClasses(accessToken);
		}

		if (!courses) {
			return NextResponse.json(
				{ message: 'Failed to fetch courses from TalkFirst' },
				{ status: 502 }
			);
		}

		// 5. Return response and refresh cookie
		const response = NextResponse.json(courses);

		response.cookies.set('accessToken', accessToken as string, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 2, // 2 hours
		});

		return response;
	} catch (error) {
		console.error('Error fetching courses:', error);
		return NextResponse.json(
			{ code: "500", message: "Internal server error", data: [] },
			{ status: 500 }
		);
	}
}
