import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * PUT /api/user/credentials
 * Update user's TalkFirst password
 */
export async function PUT(req: Request) {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { password } = body;

		if (typeof password !== 'string') {
			return NextResponse.json({ message: 'Invalid password format' }, { status: 400 });
		}

		// Update user record
		await db
			.update(users)
			.set({
				password,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));

		return NextResponse.json({ message: 'Credentials updated successfully' });
	} catch (error) {
		console.error('Update credentials error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
