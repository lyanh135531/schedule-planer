/**
 * Parallel Password Registration Verification
 */
import { db } from '../lib/db';
import { users, userCoursePlans, courseTypes } from '../lib/db/schema';
import { eq, asc } from 'drizzle-orm';

async function verify() {
	console.log('🔄 Setting up test credentials and plans...');

	const allUsers = await db.select().from(users);
	const user1 = allUsers.find(u => u.username === 'admin');
	const user2 = allUsers.find(u => u.username === 'test_user_2');

	if (!user1 || !user2) {
		console.error('Users not found, please run simulate-parallel.ts first');
		return;
	}

	// Set passwords
	console.log('Updating passwords in DB...');
	await db.update(users).set({ password: 'secret_password_1' }).where(eq(users.id, user1.id));
	await db.update(users).set({ password: 'secret_password_2' }).where(eq(users.id, user2.id));

	console.log('🚀 Triggering registration with credentials...');
	const res = await fetch('http://localhost:3000/api/cron/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer your_cron_secret'
		}
	});

	const data = await res.json();
	console.log('✅ Verification completed!');
	console.log('Summary:', JSON.stringify(data.summary, null, 2));
	console.log('\nCheck the terminal logs for [TalkFirstService] Logging in... messages with password masking.');
}

verify().then(() => process.exit(0)).catch(err => {
	console.error(err);
	process.exit(1);
});
