import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TalkFirstService } from '@/lib/talkfirst-api';
import { decrypt } from '@/lib/crypto';

/**
 * GET /api/cron/prepare
 * Pre-warm endpoint: to be called 1 minute BEFORE the actual registration.
 *
 * Does two things:
 * 1. Wakes up the Vercel serverless instance to eliminate cold start delay.
 * 2. Re-authenticates all users with TalkFirst to obtain a fresh `accessToken`
 *    so that the main /api/cron/register call can skip the login step entirely.
 */
export async function GET(req: Request) {
	const authHeader = req.headers.get('Authorization');
	const secret = process.env.CRON_SECRET;

	if (secret && authHeader !== `Bearer ${secret}`) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const startTime = Date.now();
	console.log('[Prepare] Pre-warm started...');

	try {
		// 1. Query all users from DB (this also warms up the DB connection pool)
		const allUsers = await db.select().from(users);
		console.log(`[Prepare] Loaded ${allUsers.length} user(s) from database.`);

		const results = await Promise.all(
			allUsers.map(async (user) => {
				try {
					if (!user.password) {
						return { email: user.email, status: 'skipped', reason: 'No password stored' };
					}

					const decryptedPassword = decrypt(user.password);

					console.log(`[Prepare] Logging in ${user.email}...`);
					const tokens = await TalkFirstService.login(user.email, decryptedPassword);

					if (!tokens) {
						return { email: user.email, status: 'failed', reason: 'Login failed' };
					}

					// Store the fresh tokens in DB so /api/cron/register can use them immediately
					await db.update(users)
						.set({
							accessToken: tokens.accessToken,
							refreshToken: tokens.refreshToken,
							updatedAt: new Date(),
						})
						.where(eq(users.id, user.id));

					return { email: user.email, status: 'ready' };
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					console.error(`[Prepare] Error for ${user.email}:`, message);
					return { email: user.email, status: 'error', reason: message };
				}
			})
		);

		const elapsed = Date.now() - startTime;
		console.log(`[Prepare] Pre-warm done in ${elapsed}ms.`);

		return NextResponse.json({
			message: 'Pre-warm complete. Server is ready for registration.',
			elapsedMs: elapsed,
			users: results,
		});
	} catch (error) {
		console.error('[Prepare] Fatal error:', error);
		return NextResponse.json(
			{
				message: 'Pre-warm failed',
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
