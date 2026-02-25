/**
 * Parallel Registration Simulation
 * This script ensures we have at least 2 users with plans
 * and then triggers the cron job to verify parallel execution.
 */
import { db } from '../lib/db';
import { users, userCoursePlans, courseTypes } from '../lib/db/schema';
import { eq, asc } from 'drizzle-orm';

async function prepare() {
	console.log('🔄 Preparing multiple users for parallel simulation...');

	// Ensure we have a second user
	const allUsers = await db.select().from(users);
	let user2 = allUsers.find(u => u.username === 'test_user_2');

	if (!user2) {
		console.log('Creating test_user_2...');
		[user2] = await db.insert(users).values({ username: 'test_user_2' }).returning();
	}

	const userId1 = allUsers[0].id;
	const userId2 = user2.id;

	const allTypes = await db.select().from(courseTypes).orderBy(asc(courseTypes.registrationOrder));
	const mainType = allTypes.find(t => t.name === 'MAIN-CLASS');

	// Add a plan for user 2 if empty
	const plans2 = await db.select().from(userCoursePlans).where(eq(userCoursePlans.userId, userId2));
	if (plans2.length === 0 && mainType) {
		console.log('Adding sample plan for user 2...');
		await db.insert(userCoursePlans).values({
			userId: userId2,
			courseName: 'Parallel Test Class',
			courseTypeId: mainType.id,
			day: 'Monday',
			timeSlotLabel: '09:00 - 10:00',
			startTime: '09:00',
			endTime: '10:00',
			planType: 'primary',
			externalCourseId: 'parallel_test_id'
		});
	}

	console.log('🚀 Triggering parallel registration...');
	const res = await fetch('http://localhost:3000/api/cron/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer your_cron_secret'
		}
	});

	const data = await res.json();
	console.log('✅ Cycle completed!');
	console.log('Summary:', JSON.stringify(data, null, 2));
}

prepare().then(() => process.exit(0)).catch(err => {
	console.error(err);
	process.exit(1);
});
