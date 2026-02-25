import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userCourseSettings, courseTypes, userCoursePlans } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * GET /api/settings/course-requirements
 * Get user's course requirements
 */
export async function GET() {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		// Get user's settings with course type info
		const settings = await db
			.select({
				id: userCourseSettings.id,
				courseTypeId: userCourseSettings.courseTypeId,
				courseTypeName: courseTypes.name,
				courseTypeDisplayName: courseTypes.displayName,
				requiredCount: userCourseSettings.requiredCount,
				defaultRequiredCount: courseTypes.defaultRequiredCount,
			})
			.from(userCourseSettings)
			.innerJoin(courseTypes, eq(userCourseSettings.courseTypeId, courseTypes.id))
			.where(eq(userCourseSettings.userId, userId));

		// If no settings exist, return defaults
		if (settings.length === 0) {
			const allTypes = await db.select().from(courseTypes);
			return NextResponse.json({
				settings: allTypes.map(type => ({
					courseTypeId: type.id,
					courseTypeName: type.name,
					courseTypeDisplayName: type.displayName,
					requiredCount: type.defaultRequiredCount,
					defaultRequiredCount: type.defaultRequiredCount,
				})),
				isDefault: true,
			});
		}

		return NextResponse.json({ settings, isDefault: false });
	} catch (error) {
		console.error('Get course requirements error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

/**
 * PUT /api/settings/course-requirements
 * Update user's course requirements
 * Body: { settings: [{ courseTypeId, requiredCount }] }
 */
export async function PUT(req: Request) {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { settings } = body;

		if (!Array.isArray(settings)) {
			return NextResponse.json({ message: 'Invalid settings format' }, { status: 400 });
		}

		// Validate each setting
		for (const setting of settings) {
			if (!setting.courseTypeId || typeof setting.requiredCount !== 'number') {
				return NextResponse.json({ message: 'Invalid setting format' }, { status: 400 });
			}
			if (setting.requiredCount < 0 || setting.requiredCount > 10) {
				return NextResponse.json({ message: 'Required count must be between 0 and 10' }, { status: 400 });
			}

			// Validate against existing plans
			const [courseType] = await db
				.select({ displayName: courseTypes.displayName })
				.from(courseTypes)
				.where(eq(courseTypes.id, setting.courseTypeId))
				.limit(1);

			if (!courseType) {
				return NextResponse.json({ message: `Invalid course type ID: ${setting.courseTypeId}` }, { status: 400 });
			}

			const existingPlans = await db
				.select()
				.from(userCoursePlans)
				.where(
					and(
						eq(userCoursePlans.userId, userId),
						eq(userCoursePlans.courseTypeId, setting.courseTypeId),
						eq(userCoursePlans.planType, 'primary')
					)
				);

			if (setting.requiredCount < existingPlans.length) {
				return NextResponse.json(
					{ message: `Cannot reduce ${courseType.displayName} limit to ${setting.requiredCount} because you already have ${existingPlans.length} primary sessions registered. Please remove some sessions from your plan first.` },
					{ status: 400 }
				);
			}
		}

		// Upsert each setting
		for (const setting of settings) {
			const existing = await db
				.select()
				.from(userCourseSettings)
				.where(
					and(
						eq(userCourseSettings.userId, userId),
						eq(userCourseSettings.courseTypeId, setting.courseTypeId)
					)
				)
				.limit(1);

			if (existing.length > 0) {
				// Update
				await db
					.update(userCourseSettings)
					.set({
						requiredCount: setting.requiredCount,
						updatedAt: new Date(),
					})
					.where(eq(userCourseSettings.id, existing[0].id));
			} else {
				// Insert
				await db.insert(userCourseSettings).values({
					userId,
					courseTypeId: setting.courseTypeId,
					requiredCount: setting.requiredCount,
				});
			}
		}

		return NextResponse.json({ message: 'Settings updated successfully' });
	} catch (error) {
		console.error('Update course requirements error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
