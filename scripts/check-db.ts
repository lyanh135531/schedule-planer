import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres:password@localhost:5433/talkfirst';

async function check() {
	const sql = postgres(DATABASE_URL);
	try {
		const plans = await sql`
            SELECT id, course_name, plan_type, status 
            FROM user_course_plans
            LIMIT 10
        `;
		console.log('Sample plans:');
		plans.forEach(p => console.log(`- ${p.course_name} (${p.plan_type}) [${p.status}]`));
	} catch (err) {
		console.error('Error checking columns:', err);
	} finally {
		await sql.end();
	}
}

check();
