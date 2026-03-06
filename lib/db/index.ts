import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema';

// Get database URL from environment
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/talkfirst';

// Determine which driver to use
const isNeon = connectionString.includes('neon.tech');

let dbInstance;

if (isNeon) {
	// Neon HTTP driver (Best for Vercel/Serverless)
	const sql = neon(connectionString);
	dbInstance = drizzleNeon(sql, { schema });
} else {
	// Standard Postgres-js driver (Best for Docker/Local)
	const client = postgres(connectionString, {
		max: 10,
		idle_timeout: 20,
		connect_timeout: 10,
	});
	dbInstance = drizzlePostgres(client, { schema });
}

export const db = dbInstance;
export { schema };
