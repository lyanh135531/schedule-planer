import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userCoursePlans } from '@/lib/db/schema';

/**
 * GET /api/cron/reset-weekly
 * Cron endpoint to clear all user plans and submissions every Monday at the start of the week.
 */
export async function GET(req: Request) {
	const authHeader = req.headers.get('Authorization');
	const secret = process.env.CRON_SECRET;

	// Check authentication using CRON_SECRET if it's set
	if (secret && authHeader !== `Bearer ${secret}`) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		console.log('[Weekly Reset] Starting to clear user plans and submissions...');
		
		// Delete all user plans. 
		// Note: submissionHistory is automatically deleted due to the `onDelete: 'cascade'` configuration in the schema
		await db.delete(userCoursePlans);

		console.log('[Weekly Reset] Successfully cleared user plans.');
		return NextResponse.json({
			message: 'Weekly reset complete. Cleared all user plans (submissions cleared via cascade).',
		});
	} catch (error) {
		console.error('[Weekly Reset] Error:', error);
		return NextResponse.json(
			{
				message: 'Weekly reset failed',
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
