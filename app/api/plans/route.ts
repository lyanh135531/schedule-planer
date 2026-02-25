import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userCoursePlans, courseTypes, userCourseSettings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * GET /api/plans
 * Get user's course plans (primary + backup)
 */
export async function GET() {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const plans = await db
			.select({
				id: userCoursePlans.id,
				externalCourseId: userCoursePlans.externalCourseId,
				courseCode: userCoursePlans.courseCode,
				courseName: userCoursePlans.courseName,
				syllabus: userCoursePlans.syllabus,
				lecturer: userCoursePlans.lecturer,
				room: userCoursePlans.room,
				day: userCoursePlans.day,
				timeSlotLabel: userCoursePlans.timeSlotLabel,
				startTime: userCoursePlans.startTime,
				endTime: userCoursePlans.endTime,
				planType: userCoursePlans.planType,
				priorityOrder: userCoursePlans.priorityOrder,
				linkedPrimaryId: userCoursePlans.linkedPrimaryId,
				status: userCoursePlans.status,
				courseTypeName: courseTypes.name,
				courseTypeDisplayName: courseTypes.displayName,
			})
			.from(userCoursePlans)
			.leftJoin(courseTypes, eq(userCoursePlans.courseTypeId, courseTypes.id))
			.where(eq(userCoursePlans.userId, userId));

		// Group by primary and backup
		const primary = plans.filter(p => p.planType === 'primary');
		const backup = plans.filter(p => p.planType === 'backup');

		return NextResponse.json({ primary, backup });
	} catch (error) {
		console.error('Get plans error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

/**
 * POST /api/plans
 * Add a course to user's plan
 * Body: { externalCourseId, courseCode, courseName, courseTypeName, day, startTime, endTime, timeSlotLabel, planType, linkedPrimaryId?, priorityOrder? }
 */
export async function POST(req: Request) {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const {
			externalCourseId,
			courseCode,
			courseName,
			syllabus,
			lecturer,
			room,
			courseTypeName,
			day,
			startTime,
			endTime,
			timeSlotLabel,
			planType,
			linkedPrimaryId,
			priorityOrder
		} = body;

		if (!externalCourseId || !planType || !courseName || !day) {
			return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
		}

		// Resolve courseTypeId from courseTypeName
		const [courseType] = await db
			.select()
			.from(courseTypes)
			.where(eq(courseTypes.name, courseTypeName))
			.limit(1);

		if (!courseType) {
			return NextResponse.json({ message: 'Invalid course type' }, { status: 400 });
		}

		// Validate backup requirements
		if (planType === 'backup') {
			if (!linkedPrimaryId) {
				return NextResponse.json({ message: 'Backup must be linked to a primary course' }, { status: 400 });
			}
			if (typeof priorityOrder !== 'number' || priorityOrder < 1) {
				return NextResponse.json({ message: 'Invalid priority order' }, { status: 400 });
			}
		}

		// Check for course type limits (Primary only)
		if (planType === 'primary') {
			// 1. Get required count for this course type
			const [userSetting] = await db
				.select({ count: userCourseSettings.requiredCount })
				.from(userCourseSettings)
				.where(
					and(
						eq(userCourseSettings.userId, userId),
						eq(userCourseSettings.courseTypeId, courseType.id)
					)
				)
				.limit(1);

			const requiredCount = userSetting ? userSetting.count : courseType.defaultRequiredCount;

			// 2. Count existing primary plans of this type
			const existingPrimaryCount = await db
				.select()
				.from(userCoursePlans)
				.where(
					and(
						eq(userCoursePlans.userId, userId),
						eq(userCoursePlans.planType, 'primary'),
						eq(userCoursePlans.courseTypeId, courseType.id)
					)
				);

			if (existingPrimaryCount.length >= requiredCount) {
				return NextResponse.json(
					{ message: `You have already reached the limit for ${courseType.displayName} (${requiredCount} session${requiredCount > 1 ? 's' : ''}).` },
					{ status: 400 }
				);
			}
		}

		// Check for time conflicts with existing primary plans
		if (planType === 'primary' && startTime && endTime) {
			const existingPlans = await db
				.select()
				.from(userCoursePlans)
				.where(
					and(
						eq(userCoursePlans.userId, userId),
						eq(userCoursePlans.planType, 'primary')
					)
				);

			for (const plan of existingPlans) {
				if (plan.day === day && plan.startTime && plan.endTime) {
					// Check time overlap
					if (
						(startTime >= plan.startTime && startTime < plan.endTime) ||
						(endTime > plan.startTime && endTime <= plan.endTime) ||
						(startTime <= plan.startTime && endTime >= plan.endTime)
					) {
						return NextResponse.json(
							{ message: 'Time conflict with existing plan' },
							{ status: 409 }
						);
					}
				}
			}
		}

		// Insert plan
		const [newPlan] = await db
			.insert(userCoursePlans)
			.values({
				userId,
				externalCourseId,
				courseCode,
				courseName,
				syllabus,
				lecturer,
				room,
				courseTypeId: courseType.id,
				day,
				startTime,
				endTime,
				timeSlotLabel,
				planType,
				priorityOrder: planType === 'backup' ? priorityOrder : null,
				linkedPrimaryId: planType === 'backup' ? linkedPrimaryId : null,
			})
			.returning();

		return NextResponse.json({ plan: newPlan }, { status: 201 });
	} catch (error) {
		console.error('Add plan error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

/**
 * DELETE /api/plans
 * Clear all user's plans
 */
export async function DELETE() {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		await db.delete(userCoursePlans).where(eq(userCoursePlans.userId, userId));

		return NextResponse.json({ message: 'All plans cleared' });
	} catch (error) {
		console.error('Clear plans error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
