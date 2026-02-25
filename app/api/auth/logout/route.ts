import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Clears the user session cookie
 */
export async function POST() {
	const response = NextResponse.json({ message: 'Logged out successfully' });

	const cookieStore = await cookies();
	cookieStore.delete('user_id');

	return response;
}
