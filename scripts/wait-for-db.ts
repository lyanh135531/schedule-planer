import { Pool } from 'pg';

const MAX_RETRIES = 30;
const RETRY_DELAY = 1000; // 1 second

async function waitForDatabase() {
	const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/talkfirst';
	const pool = new Pool({
		connectionString,
	});

	console.log(`⏳ Waiting for database to be ready at ${connectionString.split('@')[1]}...`);

	for (let i = 0; i < MAX_RETRIES; i++) {
		try {
			await pool.query('SELECT 1');
			console.log('✅ Database is ready!');
			await pool.end();
			return true;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.log(`⏳ Attempt ${i + 1}/${MAX_RETRIES} - Database not ready yet: ${message}`);
			await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
		}
	}

	console.error('❌ Database failed to become ready after maximum retries');
	process.exit(1);
}

waitForDatabase()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Error:', error);
		process.exit(1);
	});
