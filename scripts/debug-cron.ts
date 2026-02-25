import { db } from '../lib/db';
import { users, courseTypes, userCoursePlans, userCourseSettings, submissionHistory } from '../lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { TalkFirstService } from '../lib/talkfirst-api';
import { isOverlapping } from '../lib/utils';

async function processUserRegistration(userId: string, courseTypesList: any[]) {
	console.log(`[Diagnostic] Processing for user: ${userId}`);

	try {
		const settings = await db.select().from(userCourseSettings).where(eq(userCourseSettings.userId, userId));
		const requirementsMap = new Map(settings.map(s => [s.courseTypeId, s.requiredCount]));

		const plans = await db.select().from(userCoursePlans).where(eq(userCoursePlans.userId, userId));

		const user = (await db.select().from(users).where(eq(users.id, userId)))[0];
		if (!user) {
			console.error('User not found in DB');
			return;
		}

		const token = await TalkFirstService.login(user.username);
		if (!token) {
			console.error('Auth failed');
			return;
		}

		const registeredCourses: any[] = [];
		const registrationStats = { success: 0, failed: 0 };

		for (const type of courseTypesList) {
			const targetCount = requirementsMap.get(type.id) || type.defaultRequiredCount;
			const primaryPlans = plans.filter(p => p.planType === 'primary' && p.courseTypeId === type.id);

			let typeRegisteredCount = 0;

			for (const plan of primaryPlans) {
				console.log(`- Registering Primary: ${plan.courseName}`);
				const result = await TalkFirstService.registerCourse(plan.externalCourseId, token);

				if (result.success) {
					registeredCourses.push(plan);
					typeRegisteredCount++;
					registrationStats.success++;
				} else {
					registrationStats.failed++;
				}
			}

			if (typeRegisteredCount < targetCount) {
				const backupPlans = plans
					.filter(p => p.planType === 'backup' && p.courseTypeId === type.id)
					.sort((a, b) => (a.priorityOrder || 99) - (b.priorityOrder || 99));

				for (const backup of backupPlans) {
					if (typeRegisteredCount >= targetCount) break;

					const hasConflict = registeredCourses.some(reg =>
						reg.day === backup.day &&
						isOverlapping(reg.startTime!, reg.endTime!, backup.startTime!, backup.endTime!)
					);

					if (hasConflict) {
						console.log(`  Skipping Backup conflict: ${backup.courseName}`);
						continue;
					}

					console.log(`- Registering Backup: ${backup.courseName}`);
					const result = await TalkFirstService.registerCourse(backup.externalCourseId, token);

					if (result.success) {
						registeredCourses.push(backup);
						typeRegisteredCount++;
						registrationStats.success++;
					} else {
						registrationStats.failed++;
					}
				}
			}
		}
		console.log('Stats:', registrationStats);
	} catch (err) {
		console.error('Logic Error:', err);
	}
}

async function debug() {
	const allUsers = await db.select().from(users);
	const allCourseTypes = await db.select().from(courseTypes).orderBy(asc(courseTypes.registrationOrder));

	for (const user of allUsers) {
		await processUserRegistration(user.id, allCourseTypes);
	}
	process.exit(0);
}

debug();
