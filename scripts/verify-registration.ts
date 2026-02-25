import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres:password@localhost:5433/talkfirst';

async function verify() {
	const sql = postgres(DATABASE_URL);
	try {
		// 1. Get a test user
		const users = await sql`SELECT id FROM users LIMIT 1`;
		if (users.length === 0) {
			console.log('No users found. Please seed the database first.');
			return;
		}
		const userId = users[0].id;

		// 2. Get some course types
		const types = await sql`SELECT id, name FROM course_types`;
		const mainType = types.find(t => t.name === 'MAIN-CLASS')?.id;
		const ftType = types.find(t => t.name === 'FREE-TALK')?.id;

		// 3. Clear existing history and plans for this user to start clean
		await sql`DELETE FROM submission_history WHERE user_id = ${userId}`;
		await sql`DELETE FROM user_course_plans WHERE user_id = ${userId}`;

		// 4. Create MOCK plans
		// A Primary Main Class
		await sql`
            INSERT INTO user_course_plans (user_id, external_course_id, course_name, course_type_id, day, start_time, end_time, plan_type, status)
            VALUES (${userId}, 'ext-primary-1', 'Primary Main Class', ${mainType}, 'Monday', '08:00', '09:30', 'primary', 'planned')
        `;

		// A Primary Free Talk (Overlapping with a backup for testing conflict detection)
		await sql`
            INSERT INTO user_course_plans (user_id, external_course_id, course_name, course_type_id, day, start_time, end_time, plan_type, status)
            VALUES (${userId}, 'ext-primary-2', 'Primary Free Talk', ${ftType}, 'Tuesday', '10:00', '11:30', 'primary', 'planned')
        `;

		// A Backup Free Talk (Conflicts with Primary FT)
		await sql`
            INSERT INTO user_course_plans (user_id, external_course_id, course_name, course_type_id, day, start_time, end_time, plan_type, status, priority_order)
            VALUES (${userId}, 'ext-backup-conflict', 'Conflicting Backup FT', ${ftType}, 'Tuesday', '10:30', '12:00', 'backup', 'planned', 1)
        `;

		// A Backup Free Talk (No conflict)
		await sql`
            INSERT INTO user_course_plans (user_id, external_course_id, course_name, course_type_id, day, start_time, end_time, plan_type, status, priority_order)
            VALUES (${userId}, 'ext-backup-ok', 'Valid Backup FT', ${ftType}, 'Wednesday', '14:00', '15:30', 'backup', 'planned', 2)
        `;

		console.log('Mock plans created. Triggering registration...');

		// 5. Trigger the cron endpoint (calling the function directly via fetch if server is running)
		// Since we are in a terminal, we can use curl or just call the logic via a script
		// For simplicity, I'll assume the dev server is running on port 3000
		const res = await fetch('http://localhost:3000/api/cron/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer your_cron_secret'
			}
		});

		const data = await res.json();
		console.log('Registration Summary:', JSON.stringify(data, null, 2));

		// 6. Verify Results in DB
		const results = await sql`
            SELECT course_name, plan_type, status, failed_reason
            FROM user_course_plans
            WHERE user_id = ${userId}
            ORDER BY plan_type DESC
        `;

		console.log('\nFinal DB Status:');
		results.forEach(r => {
			console.log(`- ${r.course_name} (${r.plan_type}): ${r.status} ${r.failed_reason ? `[${r.failed_reason}]` : ''}`);
		});

	} catch (err) {
		console.error('Verification failed:', err);
	} finally {
		await sql.end();
	}
}

verify();
