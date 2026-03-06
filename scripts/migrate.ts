import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/talkfirst';

async function runMigration() {
	console.log('🔄 Running migrations...');

	const sql = postgres(connectionString, { max: 1 });
	const db = drizzle(sql);

	try {
		await migrate(db, { migrationsFolder: 'drizzle' });
		console.log('✅ Migrations completed successfully!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await sql.end();
	}
}

runMigration();
