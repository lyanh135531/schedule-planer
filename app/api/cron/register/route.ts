import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userCoursePlans, userCourseSettings, courseTypes, submissionHistory } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { TalkFirstService } from '@/lib/talkfirst-api';
import { isOverlapping } from '@/lib/utils';
import { decrypt } from '@/lib/crypto';

/**
 * GET /api/cron/register
 * Triggered by a cron job (e.g., every Sunday at 9 AM)
 * Registers courses for all users according to their plans.
 */
export async function GET(req: Request) {
	const authHeader = req.headers.get('Authorization');
	const secret = process.env.CRON_SECRET;

	// Simple secret verification
	if (secret && authHeader !== `Bearer ${secret}`) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		console.log('[Cron] Starting automated registration...');
		const allUsers = await db.select().from(users);
		const allCourseTypes = await db.select().from(courseTypes).orderBy(asc(courseTypes.registrationOrder));

		// Process all users in parallel
		const results = await Promise.all(
			allUsers.map(async (user) => {
				const userResults = await processUserRegistration(user.id, allCourseTypes);
				return { userId: user.id, email: user.email, ...userResults };
			})
		);

		return NextResponse.json({
			message: 'Automated registration cycle completed',
			summary: results
		});
	} catch (error) {
		console.error('[Cron] Global error:', error);
		return NextResponse.json({
			message: 'Internal server error',
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : null
		}, { status: 500 });
	}
}

async function processUserRegistration(userId: string, courseTypesList: (typeof courseTypes.$inferSelect)[]) {
	console.log(`[Cron] Processing registration for user: ${userId}`);

	// 1. Get user requirements
	const settings = await db.select().from(userCourseSettings).where(eq(userCourseSettings.userId, userId));
	const requirementsMap = new Map(settings.map(s => [s.courseTypeId, s.requiredCount]));

	// 2. Get all plans for this user
	const plans = await db.select().from(userCoursePlans).where(eq(userCoursePlans.userId, userId));

	// 3. Authenticate (Reuse or Login)
	const user = (await db.select().from(users).where(eq(users.id, userId)))[0];
	if (!user) throw new Error(`User not found: ${userId}`);

	let token = user.accessToken;
	let tokens = null;

	// Track successfully registered courses to prevent overlaps
	const registeredCourses: (typeof userCoursePlans.$inferSelect)[] = [];
	const registrationStats = { success: 0, failed: 0 };

	// 4. Register PRIMARY courses in order
	for (const type of courseTypesList) {
		const targetCount = requirementsMap.get(type.id) || type.defaultRequiredCount;
		const primaryPlans = plans.filter(p => p.planType === 'primary' && p.courseTypeId === type.id);

		let typeRegisteredCount = 0;

		for (const plan of primaryPlans) {
			console.log(`[Cron] Registering Primary: ${plan.courseName}`);

			// Try with existing token or login if missing
			if (!token) {
				const decryptedPassword = user.password ? decrypt(user.password) : undefined;
				tokens = await TalkFirstService.login(user.email, decryptedPassword);
				if (tokens) {
					token = tokens.accessToken;
					// Update DB
					await db.update(users).set({ accessToken: token, refreshToken: tokens.refreshToken, updatedAt: new Date() }).where(eq(users.id, userId));
				}
			}

			if (!token) return { status: 'failed', reason: 'Auth failed' };

			let result = await TalkFirstService.registerCourse(plan.externalCourseId, token as string);

			// If fails with potential 401 (mock logic might need adjustment but assuming 401 for simplicity)
			// In real world, registerCourse should return status code
			if (!result.success && result.message.includes('401')) {
				const decryptedPassword = user.password ? decrypt(user.password) : undefined;
				tokens = await TalkFirstService.login(user.email, decryptedPassword);
				if (tokens) {
					token = tokens.accessToken;
					await db.update(users).set({ accessToken: token, refreshToken: tokens.refreshToken, updatedAt: new Date() }).where(eq(users.id, userId));
					result = await TalkFirstService.registerCourse(plan.externalCourseId, token);
				}
			}

			await logSubmission(userId, plan.id!, result);

			if (result.success) {
				await db.update(userCoursePlans)
					.set({ status: 'registered', registeredAt: new Date() })
					.where(eq(userCoursePlans.id, plan.id));

				registeredCourses.push(plan);
				typeRegisteredCount++;
				registrationStats.success++;
			} else {
				await db.update(userCoursePlans)
					.set({ status: 'failed', failedReason: result.message })
					.where(eq(userCoursePlans.id, plan.id));
				registrationStats.failed++;
			}
		}

		// 5. Handle BACKUP Fallback if needed
		if (typeRegisteredCount < targetCount) {
			const backupPlans = plans
				.filter(p => p.planType === 'backup' && p.courseTypeId === type.id)
				.sort((a, b) => (a.priorityOrder || 99) - (b.priorityOrder || 99));

			for (const backup of backupPlans) {
				if (typeRegisteredCount >= targetCount) break;

				// CHECK CONFLICTS with all successfully registered courses (including other primaries)
				const hasConflict = registeredCourses.some(reg =>
					reg.day === backup.day &&
					isOverlapping(reg.startTime!, reg.endTime!, backup.startTime!, backup.endTime!)
				);

				if (hasConflict) {
					console.log(`[Cron] Skipping Backup due to conflict: ${backup.courseName}`);
					await db.update(userCoursePlans)
						.set({ status: 'skipped', failedReason: 'Time conflict with registered courses' })
						.where(eq(userCoursePlans.id, backup.id));
					continue;
				}

				console.log(`[Cron] Registering Backup: ${backup.courseName}`);
				const result = await TalkFirstService.registerCourse(backup.externalCourseId, token as string);

				await logSubmission(userId, backup.id!, result);

				if (result.success) {
					await db.update(userCoursePlans)
						.set({ status: 'registered', registeredAt: new Date() })
						.where(eq(userCoursePlans.id, backup.id));

					registeredCourses.push(backup);
					typeRegisteredCount++;
					registrationStats.success++;
				} else {
					await db.update(userCoursePlans)
						.set({ status: 'failed', failedReason: result.message })
						.where(eq(userCoursePlans.id, backup.id));
					registrationStats.failed++;
				}
			}
		}
	}

	return { status: 'completed', stats: registrationStats };
}

async function logSubmission(userId: string, planId: string, result: { success: boolean; message: string; apiResponse?: Record<string, unknown> }) {
	await db.insert(submissionHistory).values({
		userId,
		planId,
		submissionDate: new Date().toISOString().split('T')[0],
		result: result.success ? 'success' : 'failed',
		reason: result.message,
		apiResponse: result.apiResponse || null
	});
}
